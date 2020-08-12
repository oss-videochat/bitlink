import debug from "../util/debug";
import io from 'socket.io-client';
import {action, reaction} from 'mobx';

import MyInfo from "../stores/MyInfoStore";
import MyInfoStore from "../stores/MyInfoStore";
import RoomStore from "../stores/RoomStore";
import UIStore from "../stores/UIStore";
import {ResetStores} from "../util/ResetStores";
import * as mediasoupclient from 'mediasoup-client';
import Participant from "../models/Participant";
import {
    DirectMessageSummary,
    GroupMessageSummary,
    MediaAction,
    MediaSource,
    MessageGroupSummary,
    MessageSummary,
    MessageType,
    ParticipantSummary,
    RoomSettings,
    RoomSummary
} from "@bitlink/common";
import {handleEvent} from "../interfaces/handleEvent";
import * as Handlers from './handlers';
import {DirectMessage, GroupMessage, Message, SystemMessage} from "../interfaces/Message";
import ParticipantService from "../services/ParticipantService";
import NotificationService from "../services/NotificationService";
import {NotificationType} from "../enum/NotificationType";
import RoomService from "../services/RoomService";
import MyInfoService from "../services/MyInfoService";
import ChatStoreService from "../services/ChatStoreService";
import HardwareService from "../services/HardwareService";
import {MessageGroup} from "../interfaces/MessageGroup";
import StreamEffectService from "../services/StreamEffectService";
import StreamEffectStore from "../stores/StreamEffectStore";

const log = debug("IO");

interface APIResponse {
    success: boolean,
    error: string | null,
    data?: any,
    status: number
}

interface MediaStateUpdate {
    id: string,
    source: MediaSource,
    action: MediaAction;
}
const isSafari = ((/iPad|iPhone|iPod/.test(navigator.platform) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !window.MSStream) || /^((?!chrome|android).)*safari/i.test(navigator.userAgent);


class IO {
    private io: SocketIOClient.Socket;

    constructor(ioAddress: string) {
        this.io = io(ioAddress);

        const iolocal = this.io;

        function iw(func: handleEvent<any>): handleEvent {
            return (data: any, cb: any) => func({...data, io: iolocal}, cb)
        }

        this.io.on("kicked", iw(Handlers.handleKick));

        this.io.on("join-room", iw(Handlers.handleJoinRoom));

        this.io.on("waiting-room-accept", iw(Handlers.handleWaitingRoomAccept));
        this.io.on("new-waiting-room-participant", iw(Handlers.handleWaitingRoomNewParticipant));
        this.io.on("waiting-room-rejection", iw(Handlers.handleWaitingRoomRejection));

        this.io.on("destroy", iw(Handlers.handleRoomClosure));

        this.io.on("new-participant", iw(Handlers.handleNewParticipant));
        this.io.on("participant-updated-media-state", iw(Handlers.handleMediaStateUpdate));
        this.io.on("participant-left", iw(Handlers.handleParticipantLeft));
        this.io.on("participant-changed-name", iw(Handlers.handleParticipantNameChange));
        this.io.on("participant-update-role", iw(Handlers.handleParticipantUpdateRole));

        this.io.on("updated-room-settings", iw(Handlers.handleUpdatedRoomSettings));
        this.io.on("updated-room-settings-host", iw(Handlers.handleUpdatedRoomSettings));

        this.io.on("added-to-group", iw(Handlers.handleAddedToGroup));
        this.io.on("group-update-name", iw(Handlers.handleGroupUpdateName));
        this.io.on("participant-joined-group", iw(Handlers.handleNewGroupParticipant));


        this.io.on("new-message", iw(Handlers.handleNewMessage));
        this.io.on("edit-message", iw(Handlers.handleEditMessage));
        this.io.on("delete-message", iw(Handlers.handleDeleteMessage));

        // ##################
        // ## WebRTC stuff ## ASCII Art, Yey! :D
        // ##################

        this.io.on("new-consumer", iw(Handlers.handleNewConsumer));

        reaction(() => StreamEffectStore.cameraStreamEffectRunner, () => {
            if (MyInfo.participant!.mediaState.camera) {
                HardwareService.getStream("camera").then((stream) => {
                    MyInfo.producers.camera!.replaceTrack({track: stream.getVideoTracks()[0]});
                });
            }
        });

        reaction(() => {
            return {
                audio: MyInfo.preferredInputs.audio,
                video: MyInfo.preferredInputs.video
                // no screen because we don't have a default
            }

        }, async (_) => {
            log("Preferred input changed detected");
            if (
                MyInfo.preferredInputs.audio
                && MyInfo.producers.microphone
                && MyInfo.producers.microphone.track?.getSettings().deviceId !== MyInfo.preferredInputs.audio
            ) {
                log("Preferred audio input changed detected");
                HardwareService.getStream("microphone").then((stream) => {
                    MyInfo.producers.microphone!.replaceTrack({track: stream.getAudioTracks()[0]});
                });
            }
            if (
                MyInfo.preferredInputs.video
                && MyInfo.producers.camera
                && MyInfo.producers.camera.track?.getSettings().deviceId !== MyInfo.preferredInputs.video
            ) {
                log("Preferred video input changed detected");
                await StreamEffectService.generateNewEffectRunner();
                HardwareService.getStream("camera").then((stream) => {
                    MyInfo.producers.camera!.replaceTrack({track: stream.getVideoTracks()[0]});
                });
            }
        });

    }

    leave() {
        if (RoomStore.info && MyInfo.isHost && ParticipantService.getLiving(true).length > 0) {
            UIStore.store.modalStore.leaveMenu = true;
        } else {
            // eslint-disable-next-line no-restricted-globals
            const confirmed = confirm("Are you sure you would like to leave this room?");
            if (confirmed) {
                this._leave();
            }
        }
    }

    _leave() {
        log("Leaving room");
        this.io.emit("leave");
        this.reset();
    }

    endRoomForAll() {
        return this.socketRequest("end-room");
    }

    transferHost(participant: Participant) {
        return this.socketRequest("transfer-host", {
            participantId: participant.info.id
        });
    }

    reset() {
        log("Resetting stores");
        UIStore.store.modalStore.joinOrCreate = true;
        ResetStores();
    }

    createRoom(name: string) {
        log("Creating room with name %s", name);
        if (!this.io.connected) {
            log("IO is not connected");
            throw "Could not connect to server";
        }
        this.io.emit("create-room", {name});
    }

    joinRoom(id: string, name?: string) {
        log("Joining room with id: %s", id);
        if (!this.io.connected) {
            log("IO is not connected");
            throw "Could not connect to server";
        }
        UIStore.store.modalStore.joiningRoom = true;
        this.socketRequest("get-rtp-capabilities", {roomId: id})
            .then((response: APIResponse) => {
                if (!response.success) {
                    throw response.error;
                }
                RoomStore.device = new mediasoupclient.Device();
                if(isSafari){
                    response.data.headerExtensions =
                        response.data.headerExtensions.filter(
                            (ext: any) => ext.uri !== 'urn:3gpp:video-orientation' // firefox doesn't support orientation metadata so we simply tell Safari to encode the video with the proper orientation https://mediasoup.discourse.group/t/disabling-rtp-orientation-header-extension-for-mobile-safari/392
                        );
                }
                return RoomStore.device.load({routerRtpCapabilities: response.data});
            })
            .then(() => {
                this.io.emit("join-room", {
                    roomId: id,
                    name,
                    rtpCapabilities: RoomStore.device!.rtpCapabilities
                }, (response: APIResponse) => {
                    if (!response.success) {
                        if (response.status !== 403) {
                            throw response.error;
                        }
                        UIStore.store.modalStore.joiningRoom = false;
                        UIStore.store.modalStore.waitingRoom = true;
                        return;
                    }
                    this.processRoomSummary(response.data);
                    this.createTransports()
                        .then(() => this.io.emit("transports-ready"));
                    setTimeout(() => { // https://www.theatlantic.com/technology/archive/2017/02/why-some-apps-use-fake-progress-bars/517233/
                        UIStore.store.modalStore.joiningRoom = false;
                    }, 2000);

                });
            })
            .catch(error => {
                console.error("Join Error:" + error.toString());
                UIStore.store.modalStore.joiningRoom = false;
                UIStore.store.modalStore.join = true;
                NotificationService.add(NotificationService.createUINotification(`Join Error: ${error}`, NotificationType.Error))
                return;
            });
    }

    createTransports() {
        log("Starting creation of transports process");
        const addTransportListeners = (transport: mediasoupclient.types.Transport) => {
            log("Adding transport");

            transport.on("connect", async ({dtlsParameters}, callback, errback) => {
                log("Transport connect event emitted");
                const response = await this.socketRequest("connect-transport", {
                    transportId: transport.id,
                    dtlsParameters: dtlsParameters
                });
                if (!response.success) {
                    log("connect-transport request error");
                    NotificationService.add(NotificationService.createUINotification(`An error occurred connecting to the transport: ${response.error}`, NotificationType.Error))
                    errback();
                    return;
                }
                log("connect-transport request success");
                callback();
            });

            transport.on("produce", async ({kind, rtpParameters, appData}, callback, errback) => {
                log("Producing type: %s", appData.source);
                try {
                    const response: APIResponse = await this.socketRequest("create-producer", {
                        transportId: transport.id,
                        kind,
                        source: appData.source,
                        rtpParameters
                    });
                    if (!response.success) {
                        errback(response.error);
                        errback(response.error);
                        return;
                    }
                    this.socketRequest("producer-action", {source: appData.source, action: "resume"});
                    callback({id: response.data.id});
                } catch (error) {
                    errback(error);
                }
            });
        };

        return Promise.all([
            this.socketRequest("create-transport", {
                type: "webrtc",
                kind: "receiving"
            }).then((response: APIResponse) => {
                MyInfo.transports.receiving = RoomStore.device!.createRecvTransport(response.data.transportInfo);
                return addTransportListeners(MyInfo.transports.receiving);
            }),
            this.socketRequest("create-transport", {type: "webrtc", kind: "sending"}).then((response: APIResponse) => {
                MyInfo.transports.sending = RoomStore.device!.createSendTransport(response.data.transportInfo);
                return addTransportListeners(MyInfo.transports.sending);
            })
        ]);

    }

    convertMessageSummaryToMessage(message: MessageSummary): Message {
        const common = {
            id: message.id,
            created: new Date(message.created),
            type: message.type,
            content: message.content
        };

        switch (message.type) {
            case MessageType.SYSTEM: {
                return {
                    ...common,
                } as SystemMessage
            }
            case MessageType.GROUP: {
                const groupMessage = message as GroupMessageSummary;
                return {
                    ...common,
                    group: RoomService.getGroup(groupMessage.group),
                    from: ParticipantService.getById(groupMessage.from)
                } as GroupMessage
            }
            case MessageType.DIRECT: {
                const groupMessage = message as DirectMessageSummary;
                return {
                    ...common,
                    from: ParticipantService.getById(groupMessage.from),
                    to: ParticipantService.getById(groupMessage.to)
                } as DirectMessage
            }
            default: {
                throw "Unknown type"
            }
        }
    }

    convertMessageGroupSummaryToMessageGroup(summary: MessageGroupSummary): MessageGroup {
        return {
            ...summary,
            members: summary.members.map(id => ParticipantService.getById(id)!)
        }
    }

    async toggleMedia(source: MediaSource) {
        if (MyInfo.producers[source]) {
            let action: MediaAction = MyInfo.producers[source]!.paused ? "resume" : "pause";
            if (action === "pause" && source === "screen") {
                action = "close";
            }
            MyInfoService[action](source);
            this.socketRequest("producer-action", {source, action});
            return;
        }
        const stream = await HardwareService.getStream(source).catch(console.error);
        if (!stream) {
            NotificationService.add(NotificationService.createUINotification(`An error occurred accessing the ${source}`, NotificationType.Error))
            return;
        }
        log("Producing media: %s", source);
        MyInfo.producers[source] = await MyInfo.transports.sending!.produce({
            stopTracks: false,
            track: stream.getTracks()[0],
            appData: {source}
        });
        MyInfoService.resume(source);
    }

    @action
    async send(messageType: MessageType, toId: string, content: string) {
        let response;
        if (messageType === MessageType.GROUP) {
            response = await this.socketRequest("send-message", {
                messageInput: {
                    type: messageType,
                    group: toId,
                    content
                }
            });
        } else {
            response = await this.socketRequest("send-message", {
                messageInput: {
                    type: messageType,
                    to: toId,
                    content
                }
            });
        }
        if (!response.success) {
            NotificationService.add(NotificationService.createUINotification(`An error occurred sending the message: "${response.error}"`, NotificationType.Error))
            console.error("Sending Error: " + response.error);
            return false;
        }
        return true;
    }

    @action
    async edit(messageId: string, content: string) {
        const response = await this.socketRequest("edit-message", {messageId: messageId, newContent: content});

        if (!response.success) {
            NotificationService.add(NotificationService.createUINotification(`An error occurred editing the message: "${response.error}"`, NotificationType.Error))
            console.error("Editing Error: " + response.error);
            return false;
        }

        return true;
    }

    @action
    async delete(messageId: string) {
        const response = await this.socketRequest("delete-message", {messageId: messageId});

        if (!response.success) {
            NotificationService.add(NotificationService.createUINotification(`An error occurred deleting the message: "${response.error}"`, NotificationType.Error))
            console.error("Deleting Error: " + response.error);
            return false;
        }
        return true;
    }


    async waitingRoomDecision(id: string, accept: boolean) {
        const response = await this.socketRequest("waiting-room-decision", {
            id,
            decision: accept ? "accept" : "reject"
        });

        if (!response.success) {
            NotificationService.add(NotificationService.createUINotification(`An error occurred while deciding on waiting room member: "${response.error}"`, NotificationType.Error))
            console.error("Waiting Room Error: " + response.error);
            return false;
        }
        return true;
    }

    async changeName(newName: string) {
        const response = await this.socketRequest("change-name", {newName});
        if (response.success) {
            MyInfo.participant!.name = newName;
        }
    }


    async getRoomSettings(): Promise<RoomSettings> {
        const response = await this.socketRequest("get-room-settings");
        if (!response.success) {
            NotificationService.add(NotificationService.createUINotification("Error Getting Settings: " + response.error, NotificationType.Error));
            throw response.error;
        }
        return response.data.settings;
    }

    async changeRoomSettings(newSettings: RoomSettings): Promise<undefined> {
        const response = await this.socketRequest("update-room-settings", {newSettings});
        if (!response.success) {
            NotificationService.add(NotificationService.createUINotification("Error Getting Settings: " + response.error, NotificationType.Error));
            throw response.error;
        }
        RoomStore.info!.name = newSettings.name;
        return;
    }

    async kick(participant: Participant): Promise<void> {
        const response = await this.socketRequest("kick-participant", {participantId: participant.info.id});
        if (!response.success) {
            NotificationService.add(NotificationService.createUINotification("Error Kicking Participant: " + response.error, NotificationType.Error));
            throw response.error;
        }
        return;
    }

    processRoomSummary(data: { summary: RoomSummary, rtcCapabilities: any }) {
        const roomSummary = data.summary;
        const participants = roomSummary.participants.map((participantSummary: ParticipantSummary) => {
            const participant = new Participant(participantSummary);
            if (participant.info.id === roomSummary.myId) {
                MyInfoStore.participant = participantSummary;
            }
            return participant;
        });
        ParticipantService.replace(participants);

        roomSummary.messages.forEach((message: MessageSummary) => {
            const realMessage = this.convertMessageSummaryToMessage(message);
            ChatStoreService.addMessage(realMessage);
        });

        RoomStore.info = roomSummary;
        RoomStore.mediasoup.rtcCapabilities = data.rtcCapabilities;
        UIStore.store.joinedDate = new Date();
    }

    socketRequest(event: string, data = {}): Promise<APIResponse> {
        return new Promise(async (resolve, reject) => {
            this.io.emit(event, data, (json: APIResponse) => {
                resolve(json);
            });
        });
    }

}

const ioAddress = process.env.NODE_ENV === "development" ? ("http://" + window.location.hostname + ":3001") : ("https://" + window.location.hostname);

export default new IO(ioAddress);
