import * as Event from 'events'
import Participant from "./Participant";
import Message from "./Message";
import {APIResponse, APIResponseCallback} from "./APIResponse";
import * as mediasoup from 'mediasoup';
import {config} from "../../config";

interface ParticipantAuthObj {
    id: string,
    key: string
}

class Room extends Event.EventEmitter {
    get router(): mediasoup.types.Router {
        return this._router;
    }

    public id: string;
    public name: string;
    public idHash: string;
    private readonly participants: Array<Participant> = [];
    private readonly messages: Array<Message> = []; // TODO mongodb
    private configuration;
    public readonly created;
    private _router: mediasoup.types.Router;
    private liveProducers: Array<mediasoup.types.Producer> = [];

    constructor(name: string = "Untitled Room", router: mediasoup.types.Router) {
        super();
        this.name = name;
        this.created = new Date();
        this._router = router;

        setTimeout(() => {
            if (this.getActiveParticipants().length === 0) {
                this.destroy();
            }
        }, 10000); // user has 10 seconds to join the room they created before it will be destroyed
    }

    addParticipant(participant: Participant, cb: APIResponseCallback) {
        this.addListeners(participant);

        if (this.getActiveParticipants().length === 0) {
            this.addHostListeners(participant);
        }

        this.participants.push(participant);

        cb({
            success: true, error: null, status: 200, data: {
                summary: this.getSummary(participant),
                rtcCapabilities: this._router.rtpCapabilities
            }
        });

        this.emit("new-participant", participant);
        this.broadcast("new-participant", [participant], participant.toSummary());
    }

    leaveParticipant(participant: Participant) {
        participant.kill();
        console.log("left");
        this.broadcast("participant-left", [], participant.id);
    }

    addHostListeners(participant: Participant) {
        participant.isHost = true;
    }

    getActiveParticipants() {
        return this.participants.filter(participant => participant.isAlive);
    }

    addListeners(participant: Participant) {
        participant.on("leave", () => {
            this.leaveParticipant(participant);
            if (this.getActiveParticipants().length === 0 || participant.isHost) {
                this.destroy();
            }
        });
        participant.on("media-state-update", () => {
            this.broadcast("participant-updated-media-state", [participant],
                {
                    id: participant.id,
                    mediaState: participant.mediaState
                }
            );
        });



        participant.socket.on("send-message", (to: string, content: string, cb) => {
            const response: APIResponse = this.sendMessage(participant, to, content);
            cb(response);
        });

        participant.socket.on("edit-message", (messageId: string, content: string, cb) => {
            const response: APIResponse = this.editMessage(participant, messageId, content);
            cb(response);
        });

        participant.socket.on("delete-message", (messageId: string, cb) => {
            const response: APIResponse = this.deleteMessage(participant, messageId);
            cb(response);
        });


        // ##################
        // ## WebRTC stuff ## ASCII Art, Yey! :D
        // ##################


        participant.socket.on("create-transport", async (type, kind, cb: (response: APIResponse) => void) => {
            let transport;
            switch (type) {
                case "webrtc":
                    transport = await this._router.createWebRtcTransport(config.mediasoup.webRtcTransportOptions);
                    break;
                case "plain":
                    transport = await this._router.createPlainTransport(config.mediasoup.plainTransportOptions);
                    break;
                default:
                    cb({
                        success: false,
                        error: "Unknown type",
                        status: 400
                    });
                    return;
            }
            participant.mediasoupPeer.addTransport(transport, kind);
            cb({
                success: true,
                error: null,
                status: 200,
                data: {
                    transportInfo: {
                        id: transport.id,
                        iceParameters: transport.iceParameters,
                        iceCandidates: transport.iceCandidates,
                        dtlsParameters: transport.dtlsParameters,
                    },
                    transportType: type,
                }
            });
        });


        participant.socket.on("connect-transport", async (transportId, dtlsParameters, cb: (response: APIResponse) => void) => {
            const transport = participant.mediasoupPeer.getTransport(transportId);
            if (!transport) {
                cb({
                    success: false,
                    error: "Could not find a transport with that id",
                    status: 404
                });
                return;
            }
            await transport.connect({dtlsParameters});
            cb({
                success: true,
                error: null,
                status: 200,
            });
        });

        participant.socket.once("transports-ready", () => {
            this.participants.forEach(participantJoined => {
                if (participantJoined.id === participant.id) {
                    return;
                }
                Object.keys(participantJoined.mediasoupPeer.producers).forEach(type => {
                    this.createConsumerAndNotify(participantJoined, participant, type as "video" | "audio");
                });
            });
        });

        participant.socket.on("create-producer", async (transportId, kind, rtpParameters, cb: (response: APIResponse) => void) => {
            const transport = participant.mediasoupPeer.getTransport(transportId);
            if (!transport) {
                cb({
                    success: false,
                    error: "Could not find a transport with that id",
                    status: 404
                });
                return;
            }
            if (kind !== "video" && kind !== "audio") {
                cb({
                    success: false,
                    error: "Some error occurred. Probably your crappy input.",
                    status: 400
                });
                return;
            }
            try {
                const producer: mediasoup.types.Producer = await transport.produce({
                    kind,
                    rtpParameters
                });
                participant.mediasoupPeer.addProducer(producer, kind);
                this._handleNewProducer(participant, kind);
                cb({
                    success: true,
                    error: null,
                    data: {
                        id: producer.id
                    },
                    status: 200,
                });
            } catch (e) {
                cb({
                    success: false,
                    error: "Some error occurred. Probably your crappy input.",
                    status: 400
                });
            }
        });
    }

    _handleNewProducer(theParticipant, kind: "video" | "audio") {
        this.participants.forEach(aParticpant => {
           if(aParticpant.id === theParticipant.id) {
               return;
           }
           this.createConsumerAndNotify(theParticipant, aParticpant, kind)
        });
    }

    broadcast(event: string, ignoreParticipants: Array<Participant> = [], ...args: any[]) {
        this.participants.forEach(participant => {
            if (ignoreParticipants.includes(participant) || !participant.isAlive) {
                return;
            }
            participant.socket.emit(event, ...args);
        });
    }

    destroy() {
        console.log("Destroyed");
        this.broadcast("destroy");
        this.emit("destroy");
    }

    sendMessage(from: Participant, toId: string, content): APIResponse {
        let message;
        if (toId === "everyone") {
            message = new Message(from, toId, content);
        } else {
            const toParticipant: Participant = this.participants.find(participant => participant.id === toId);
            if (!toParticipant) {
                return {success: false, error: "Could not find to participant", status: 404}
            }
            message = new Message(from, toParticipant, content);
        }
        this.messages.push(message);
        this.alertRelevantParticipantsAboutMessage(message, "new");

        message.on("edit", () => this.alertRelevantParticipantsAboutMessage(message, "edit"));
        message.on("delete", () => this.alertRelevantParticipantsAboutMessage(message, "delete"));

        return {success: true, error: null, data: message.toSummary(), status: 200};
    }

    alertRelevantParticipantsAboutMessage(message: Message, eventType: "new" | "edit" | "delete") {
        if (message.isToEveryone) {
            return this.broadcast(eventType + "-room-message", [message.from], message.toSummary());
        }
        return message.to.directMessage(message, eventType);
    }

    editMessage(from: Participant, messageId: string, content: string): APIResponse {
        const message = this.getMessage(messageId);
        if (!message) {
            return {success: false, error: "Could not find message", status: 404}
        }
        if (message.from.id !== from.id) {
            return {success: false, error: "You are not authorized to preform this action", status: 403}
        }
        message.edit(content);
        return {success: true, error: null, status: 200};
    }

    deleteMessage(from: Participant, messageId: string): APIResponse {
        const message = this.getMessage(messageId);
        if (!message) {
            return {success: false, error: "Could not find message", status: 404}
        }
        if (message.from.id !== from.id) {
            return {success: false, error: "You are not authorized to preform this action", status: 403}
        }
        message.delete();
        return {success: true, error: null, status: 200};
    }

    getMessage(messageId: string) {
        return this.messages.find(message => message.id === messageId);
    }

    getSummary(currentParticipant: Participant) {
        return {
            id: this.id,
            idHash: this.idHash,
            name: this.name,
            participants: this.participants.map(participantInRoom => {
                const obj: any = {
                    isMe: participantInRoom.id === currentParticipant.id,
                    ...participantInRoom.toSummary()
                };
                if (obj.isMe) {
                    obj.key = participantInRoom.key
                }
                return obj;
            }),
            messages: this.messages.filter(message => message.isToEveryone
                || (currentParticipant
                    && message.from.id === currentParticipant.id
                    || message.to.id === currentParticipant.id
                )
            ).map(message => message.toSummary())
        }
    }

    async createConsumerAndNotify(producerPeer: Participant, consumerPeer: Participant, kind: "video" | "audio") {
        const producer = producerPeer.mediasoupPeer.getProducersByKind(kind);
        if (
            !consumerPeer.mediasoupPeer.rtcCapabilities
            || !this._router.canConsume({
            producerId: producer.id,
            rtpCapabilities: consumerPeer.mediasoupPeer.rtcCapabilities
        })
        ) {
            return;
        }
        const transport = await producerPeer.mediasoupPeer.transports.receiving;

        if (!transport) {
            return;
        }

        const consumer = await transport.consume({
            producerId: producer.id,
            rtpCapabilities: consumerPeer.mediasoupPeer.rtcCapabilities,
            paused: true,
        });

        consumerPeer.mediasoupPeer.addConsumer(consumer);

        consumerPeer.socket.emit("new-consumer", kind,  producerPeer.id, {
            producerId: producer.id,
            consumerId: consumer.id,
            rtpParameters: consumer.rtpParameters,
            producerPaused: consumer.producerPaused,
        });
    }

}

export default Room;
