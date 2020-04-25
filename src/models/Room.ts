import * as Event from 'events'
import Participant from "./Participant";
import Message from "./Message";
import {APIResponse, APIResponseCallback} from "./APIResponse";
import * as mediasoup from 'mediasoup';
import {config} from "../../config";
import {UpdateRoomSettingsValidation} from "../helpers/validation/UpdateRoomSettings";

interface ParticipantAuthObj {
    id: string,
    key: string
}

interface RoomSettings {
    name: string
    waitingRoom: boolean,
}

class Room extends Event.EventEmitter {
    get router(): mediasoup.types.Router {
        return this._router;
    }

    private static defaultSettings: RoomSettings = {
        waitingRoom: false,
        name: undefined
    };

    public id: string;
    public idHash: string;
    private readonly participants: Array<Participant> = [];
    private readonly waitingRoom: Array<Participant> = [];

    private readonly messages: Array<Message> = []; // TODO mongodb
    private settings: RoomSettings = {...Room.defaultSettings};
    public readonly created;
    private _router: mediasoup.types.Router;

    constructor(name: string = "Untitled Room", router: mediasoup.types.Router) {
        super();
        this.settings.name = name;
        this.created = new Date();
        this._router = router;

        setTimeout(() => {
            if (this.getConnectedParticipants().length === 0) {
                this.destroy();
            }
        }, 10000); // user has 10 seconds to join the room they created before it will be destroyed
    }

    addParticipant(participant: Participant, cb: APIResponseCallback) {
        participant.socket.on("leave", () => {
            this.leaveParticipant(participant);
            if (this.getConnectedParticipants().length === 0 || this.getHosts().length === 0) {
                this.destroy();
            }
        });
        participant.on("disconnect", () => { // TODO this should be different from above
            this.leaveParticipant(participant);
            if (this.getConnectedParticipants().length === 0 || this.getHosts().length === 0) {
                this.destroy();
            }
        });

        if (this.getConnectedParticipants().length === 0) {
            participant.isHost = true;
        }

        if (this.settings.waitingRoom && !participant.isHost) {
            this.waitingRoom.push(participant);
            cb({
                success: false, error: "In waiting room", status: 403, data: {
                    name: this.settings.name
                }
            });

            this.broadcastHosts("new-waiting-room-participant", {
                participant: participant.toSummary()
            });

            return;
        }

        this._addParticipant(participant);

        cb({
            success: true, error: null, status: 200, data: {
                summary: this.getSummary(participant),
                rtcCapabilities: this._router.rtpCapabilities
            }
        });

    }

    _addParticipant(participant: Participant) {
        this.addListeners(participant);

        if (this.getConnectedParticipants().length === 0) {
            participant.isHost = true;
        }

        this.participants.push(participant);

        this.emit("new-participant", participant);
        this.broadcast("new-participant", [participant], participant.toSummary());
    }

    leaveParticipant(participant: Participant) {
        participant.leave();
        console.log("left");
        this.broadcast("participant-left", [], participant.id);
    }

    getConnectedParticipants(): Participant[] {
        return this.participants.filter(participant => participant.isConnected);
    }

    getHosts(): Participant[] {
        return this.participants.filter(participant => participant.isHost && participant.isConnected);
    }

    addListeners(participant: Participant) {
        participant.on("media-state-update", (kind, action) => {
            this.broadcast("participant-updated-media-state", [participant],
                {
                    id: participant.id,
                    kind,
                    action
                }
            );
        });

        participant.socket.on("waiting-room-decision", (id, decision: "accept" | "reject", cb: APIResponseCallback) => {
            if (!participant.isHost) {
                cb({
                    success: false,
                    error: "You aren't important enough. You aren't a host.",
                    status: 403
                });
                return;
            }
            const waitingRoomIndex = this.waitingRoom.findIndex(patientParticipant => patientParticipant.id === id);
            if (waitingRoomIndex < 0) {
                cb({
                    success: false,
                    error: "Could not find participant in the waiting room with that id.",
                    status: 404
                });
                return;
            }
            const patientParticipant = this.waitingRoom[waitingRoomIndex];
            this.waitingRoom.splice(waitingRoomIndex, 1);

            switch (decision) {
                case "accept":
                    this._addParticipant(patientParticipant);
                    patientParticipant.socket.emit("waiting-room-accept", {
                        summary: this.getSummary(patientParticipant),
                        rtcCapabilities: this._router.rtpCapabilities
                    });
                    cb({
                        success: true,
                        error: null,
                        status: 200
                    });
                    break;
                case "reject":
                    patientParticipant.socket.emit("waiting-room-rejection", "The host rejected you.");
                    this.leaveParticipant(patientParticipant);
                    cb({
                        success: true,
                        error: null,
                        status: 200
                    });
                    break;
                default:
                    cb({
                        success: false,
                        error: "Bad decision. Please decide better.",
                        status: 400
                    });
            }
        });

        participant.socket.on("get-room-settings", (cb: APIResponseCallback) => {
            if (!participant.isHost) {
                cb({
                    success: false,
                    status: 403,
                    error: "You are not a host"
                });
                return;
            }
            cb({
                success: true,
                status: 200,
                error: null,
                data: {
                    settings: this.settings
                }
            });
        });

        participant.socket.on("change-name", (newName, cb: APIResponseCallback) => {
            participant.name = newName;
            this.broadcast("participant-changed-name", [participant], participant.id, participant.name);
            cb({
                success: true,
                status: 200,
                error: null,
            });
        });

        participant.socket.on("update-room-settings", (newSettings, cb: APIResponseCallback) => {
            if (!participant.isHost) {
                cb({
                    success: false,
                    status: 403,
                    error: "You are not a host"
                });
                return;
            }
            if (!UpdateRoomSettingsValidation(newSettings)) {
                cb({
                    success: false,
                    status: 400,
                    error: "Bad input."
                });
                return;
            }
            if (newSettings.name !== this.settings.name) {
                this.broadcast("update-room-settings", this.getConnectedParticipants().filter(participant1 => participant1.isHost), this.makeSettingsSafe(newSettings));
                this.broadcast("update-room-settings-host", this.getConnectedParticipants().filter(participant1 => participant1.isHost), newSettings);
            }

            this.settings = newSettings;
            cb({
                success: true,
                status: 200,
                error: null,
                data: {
                    settings: this.settings
                }
            });
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


        participant.socket.on("connect-transport", (transportId, dtlsParameters, cb: (response: APIResponse) => void) => {
            const transport: mediasoup.types.Transport = participant.mediasoupPeer.getTransport(transportId);
            if (!transport) {
                cb({
                    success: false,
                    error: "Could not find a transport with that id",
                    status: 404
                });
                return;
            }
            if (transport.appData.connected) {
                cb({
                    success: false,
                    error: "Transport already connected",
                    status: 409,
                });
                return;
            }
            transport.connect({dtlsParameters})
                .then(() => {
                    transport.appData.connected = true;
                    cb({
                        success: true,
                        error: null,
                        status: 200,
                    });
                })
                .catch(err => {
                    console.error(err);
                    cb({
                        success: false,
                        error: "Unknown server error occurred. Check server log.",
                        status: 500,
                    });
                });
        });

        participant.socket.once("transports-ready", () => {
            this.getConnectedParticipants().forEach(participantJoined => {
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
        this.getConnectedParticipants().forEach(aParticpant => {
            if (aParticpant.id === theParticipant.id) {
                return;
            }
            this.createConsumerAndNotify(theParticipant, aParticpant, kind)
        });
    }

    broadcast(event: string, ignoreParticipants: Participant[] = [], ...args: any[]) {
        this.getConnectedParticipants().forEach(participant => {
            if (ignoreParticipants.includes(participant)) {
                return;
            }
            participant.socket.emit(event, ...args);
        });
    }

    broadcastHosts(events: string, ...args: any[]) {
        const nonHosts: Participant[] = this.getConnectedParticipants().filter((participant: Participant) => !participant.isHost);
        this.broadcast(events, nonHosts, ...args); // broadcast ignoring non hosts
    }

    destroy() {
        console.log("Destroyed");
        this.router.close();
        this.broadcast("destroy");
        this.emit("destroy");
    }

    sendMessage(from: Participant, toId: string, content): APIResponse {
        let message;
        if (toId === "everyone") {
            message = new Message(from, toId, content);
        } else {
            const toParticipant: Participant = this.getConnectedParticipants().find(participant => participant.id === toId);
            if (!toParticipant) {
                return {success: false, error: "Could not find to participant", status: 404}
            }
            message = new Message(from, toParticipant, content);
        }
        this.messages.push(message);
        this.alertRelevantParticipantsAboutMessage(message, "new");

        message.on("edit", () => this.alertRelevantParticipantsAboutMessage(message, "edit"));
        message.on("delete", () => {
            const index = this.getMessageIndex(message.id);
            if (index) {
                this.messages.splice(index, 1);
            }
            this.alertRelevantParticipantsAboutMessage(message, "delete")
        });

        return {success: true, error: null, data: message.toSummary(), status: 200};
    }

    alertRelevantParticipantsAboutMessage(message: Message, eventType: "new" | "edit" | "delete") {
        console.log(eventType);
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
        const message: Message = this.getMessage(messageId);
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

    getMessageIndex(messageId: string) {
        return this.messages.findIndex(message => message.id === messageId);
    }

    getSummary(currentParticipant: Participant) {
        return {
            id: this.id,
            idHash: this.idHash,
            name: this.settings.name,
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

    makeSettingsSafe(settings: RoomSettings) {
        return {
            name: settings.name
        }
    }

    async createConsumerAndNotify(producerPeer: Participant, consumerPeer: Participant, kind: "video" | "audio") {
        const producer = producerPeer.mediasoupPeer.getProducersByKind(kind);
        if (
            !producer
            || !consumerPeer.mediasoupPeer.rtcCapabilities
            || !this._router.canConsume({
                producerId: producer.id,
                rtpCapabilities: consumerPeer.mediasoupPeer.rtcCapabilities
            })
        ) {
            return;
        }
        const transport = await consumerPeer.mediasoupPeer.transports.receiving;

        if (!transport) {
            return;
        }

        const consumer = await transport.consume({
            producerId: producer.id,
            rtpCapabilities: consumerPeer.mediasoupPeer.rtcCapabilities,
            paused: true,
        });

        consumerPeer.mediasoupPeer.addConsumer(consumer);

        consumerPeer.socket.emit("new-consumer", kind, producerPeer.id, {
            producerId: producer.id,
            consumerId: consumer.id,
            rtpParameters: consumer.rtpParameters,
            producerPaused: consumer.producerPaused,
        }, (success) => {
            if (success) {
                consumer.resume();
            }
        });
    }

}

export default Room;
