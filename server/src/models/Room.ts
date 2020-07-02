import * as Event from 'events'
import Participant from "./Participant";
import Message from "./Message";
import {APIResponse, APIResponseCallback} from "./APIResponse";
import * as mediasoup from 'mediasoup';
import {config} from "../../config";
import {UpdateRoomSettingsValidation} from "../helpers/validation/UpdateRoomSettings";
import debug from "../helpers/debug";
import {MediaAction, MediaSource, MediaType} from "@bitlink/common";
import {MediaSourceToTypeMap} from "@bitlink/common";
import {ParticipantRole} from "@bitlink/common";

const log = debug("Room");

interface ParticipantAuthObj {
    id: string,
    key: string
}

interface RoomSettings {
    name: string
    waitingRoom: boolean,
}

class Room extends Event.EventEmitter {
    private static defaultSettings: RoomSettings = {
        waitingRoom: false,
        name: undefined
    };

    public id: string;
    public idHash: string;
    private readonly participants: Array<Participant> = [];
    private readonly waitingRoom: Array<Participant> = [];
    private readonly messages: Array<Message> = []; // TODO mongodb
    private readonly latestMessage = {};
    public readonly created;
    public readonly router: mediasoup.types.Router;
    public settings: RoomSettings = {...Room.defaultSettings};

    constructor(name: string = "Untitled Room", router: mediasoup.types.Router) {
        super();
        log("New room with name %s", name)
        this.settings.name = name;
        this.created = new Date();
        this.router = router;

        setTimeout(() => {
            if (this.getConnectedParticipants().length === 0) {
                this.destroy();
            }
        }, 10000); // user has 10 seconds to join the room they created before it will be destroyed
    }

    addParticipant(participant: Participant, cb: APIResponseCallback) {
        log("Participant adding %s", participant.name)
        participant.socket.on("leave", () => {
            log("Participant left %s", participant.name);
            this.leaveParticipant(participant);
            if (this.getConnectedParticipants().length === 0 || this.getHosts().length === 0) {
                this.destroy();
            }
        });
        participant.on("disconnect", () => { // TODO this should be different from above
            log("Participant disconnected %s", participant.name)
            this.leaveParticipant(participant);
            if (this.getConnectedParticipants().length === 0 || this.getHosts().length === 0) {
                this.destroy();
            }
        });

        if (this.getConnectedParticipants().length === 0) {
            participant.role = ParticipantRole.HOST;
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
                rtcCapabilities: this.router.rtpCapabilities
            }
        });

    }

    _addParticipant(participant: Participant) {
        this.addListeners(participant);

        if (this.getConnectedParticipants().length === 0) {
            participant.role = ParticipantRole.HOST;
        }

        this.participants.push(participant);

        this.emit("new-participant", participant);
        this.broadcast("new-participant", [participant], participant.toSummary());
    }

    leaveParticipant(participant: Participant) {
        log("Forcing participant to leave", participant.name)
        participant.leave();
        this.broadcast("participant-left", [], participant.id);
    }

    kickParticipant(participant: Participant) {
        log("Participant kicked", participant.name)
        this.leaveParticipant(participant);
        participant.socket.emit("kicked");
    }

    getConnectedParticipants(): Participant[] {
        return this.participants.filter(participant => participant.isConnected);
    }

    getHosts(): Participant[] {
        return this.participants.filter(participant => participant.isHost && participant.isConnected);
    }

    addListeners(participant: Participant) {
        participant.on("media-state-update", (source: MediaSource, action: MediaAction) => {
            log("Participant %s media state update %s:%S", participant.name, source, action);

            this.broadcast("participant-updated-media-state", [participant],
                {
                    id: participant.id,
                    source,
                    action
                }
            );
        });

        participant.socket.on("waiting-room-decision", (id, decision: "accept" | "reject", cb: APIResponseCallback) => {
            log("Receiving waiting room decision %s", decision);
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
                        rtcCapabilities: this.router.rtpCapabilities
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
            log("Participant requesting room settings %s", participant.name);
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
            log("Participant changing name %s --> %s", participant.name, newName);
            participant.name = newName;
            this.broadcast("participant-changed-name", [participant], participant.id, participant.name);
            cb({
                success: true,
                status: 200,
                error: null,
            });
        });

        participant.socket.on("update-room-settings", (newSettings, cb: APIResponseCallback) => {
            log("Participant changing room settings %O", newSettings);
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

        participant.socket.on("kick-participant", (participantId: string, cb: APIResponseCallback) => {
            if (!participant.isHost) {
                cb({
                    success: false,
                    status: 401,
                    error: "You must be a host to kick people.",
                });
                return;
            }

            const participantToRemove = this.participants.find(participant => participant.id === participantId);
            if (!participantToRemove || !participantToRemove.isConnected) {
                cb({
                    success: false,
                    status: 404,
                    error: "Could not find that participant",
                });
                return;
            }

            if (participantToRemove.isHost) {
                cb({
                    success: false,
                    status: 401,
                    error: "You cannot kick a host",
                    data: {
                        settings: this.settings
                    }
                });
                return;
            }

            this.kickParticipant(participantToRemove);
        });


        participant.socket.on("send-message", (to: string, content: string, cb) => {
            log("Participant sending message");
            if (this.latestMessage.hasOwnProperty(participant.id)
                && Date.now() - this.latestMessage[participant.id] < 250) { // throttling
                cb({
                    success: false,
                    status: 429,
                    error: "Please wait before sending messages"
                });
                return;
            }
            const response: APIResponse = this.sendMessage(participant, to, content);
            if (response.success) {
                this.latestMessage[participant.id] = Date.now();
            }
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
            log("Participant creating a transport %s:%s", participant.name, kind);
            let transport;
            switch (type) {
                case "webrtc":
                    transport = await this.router.createWebRtcTransport(config.mediasoup.webRtcTransportOptions);
                    break;
                case "plain":
                    transport = await this.router.createPlainTransport(config.mediasoup.plainTransportOptions);
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
            log("Participant connecting to a transport %s:%s", participant.name, transportId);
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
            log("Participant says their transports are ready %s", participant.name);
            this.getConnectedParticipants().forEach(participantJoined => {
                if (participantJoined.id === participant.id) {
                    return;
                }
                Object.keys(participantJoined.mediasoupPeer.producers).forEach(type => {
                    this.createConsumerAndNotify(participantJoined, participant, type as MediaSource);
                });
            });
        });

        participant.socket.on("create-producer", async (transportId, kind: MediaType, source: MediaSource, rtpParameters, cb: (response: APIResponse) => void) => {
            log("Participant creating a producer %s:%s", participant.name, source);
            const transport = participant.mediasoupPeer.getTransport(transportId);
            if (!transport) {
                cb({
                    success: false,
                    error: "Could not find a transport with that id",
                    status: 404
                });
                return;
            }
            if (!["camera", "microphone", "screen"].includes(source)) {
                cb({
                    success: false,
                    error: "Some error occurred. Probably your crappy input.",
                    status: 400
                });
                return;
            }
            if (!["video", "audio"].includes(kind)) {
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
                participant.mediasoupPeer.addProducer(producer, source);
                this._handleNewProducer(participant, source);
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

    _handleNewProducer(theParticipant, source: MediaSource) {
        this.getConnectedParticipants().forEach(aParticpant => {
            if (aParticpant.id === theParticipant.id) {
                return;
            }
            this.createConsumerAndNotify(theParticipant, aParticpant, source)
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
        this.router.close();
        this.broadcast("destroy");
        this.emit("destroy");
    }

    sendMessage(from: Participant, toId: string, content): APIResponse {
        let message: Message;
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
            participants: this.participants.map(participantInRoom => participantInRoom.toSummary()),
            myId: currentParticipant.id,
            messages: this.messages
                .filter(message =>
                    message.isToEveryone
                    || (
                        currentParticipant
                        && message.from.id === currentParticipant.id
                        || message.to.id === currentParticipant.id
                    )
                )
                .map(message => message.toSummary())
        }
    }

    makeSettingsSafe(settings: RoomSettings) {
        return {
            name: settings.name
        }
    }

    async createConsumerAndNotify(producerPeer: Participant, consumerPeer: Participant, source: MediaSource) {
        log("New consumer creation { Producer: %s | Consumer: %s }", producerPeer.name, consumerPeer.name);
        const producer = producerPeer.mediasoupPeer.producers[source];
        if (
            !producer
            || !consumerPeer.mediasoupPeer.rtcCapabilities
            || !this.router.canConsume({
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

        consumerPeer.socket.emit("new-consumer", source, MediaSourceToTypeMap[source], producerPeer.id, {
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
