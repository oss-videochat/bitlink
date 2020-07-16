import debug from "../util/debug";
import io from 'socket.io-client';
import ParticipantsStore from "../stores/ParticipantsStore";
import {action, reaction} from 'mobx';

import CurrentUserInformationStore from "../stores/MyInfo";
import MyInfo from "../stores/MyInfo";
import RoomStore from "../stores/RoomStore";
import ChatStore from "../stores/ChatStore";
import {Message} from "../stores/MessagesStore";
import NotificationStore, {NotificationType, UINotification} from "../stores/NotificationStore";
import UIStore from "../stores/UIStore";
import {ResetStores} from "../util/ResetStores";
import * as mediasoupclient from 'mediasoup-client';
import Participant, {ParticipantData} from "../models/Participant";
import {MediaAction, MediaSource, MediaType, ParticipantSummary, MessageSummary, RoomSummary} from "@bitlink/common";

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

export interface RoomSettingsObj {
    name: string
    waitingRoom: boolean,
}

class IO {
    private io: SocketIOClient.Socket;

    constructor(ioAddress: string) {
        this.io = io(ioAddress);

        this.io.on("kicked", this._handleKick.bind(this));

        this.io.on("join-room", this._handleJoinRoom.bind(this));

        this.io.on("waiting-room-accept", this._handleWaitingRoomAccept.bind(this));
        this.io.on("new-waiting-room-participant", this._handleWaitingRoomNewParticipant.bind(this));
        this.io.on("waiting-room-rejection", this._handleWaitingRoomRejection.bind(this));

        this.io.on("destroy", this._handleRoomClosure.bind(this));

        this.io.on("new-participant", this._handleNewParticipant.bind(this));
        this.io.on("participant-updated-media-state", this._handleMediaStateUpdate.bind(this));
        this.io.on("participant-left", this._handleParticipantLeft.bind(this));
        this.io.on("participant-changed-name", this._handleParticipantNameChange.bind(this));

        this.io.on("update-room-settings", this._handleUpdatedRoomSettings.bind(this));
        this.io.on("update-room-settings-host", this._handleUpdatedRoomSettings.bind(this));


        this.io.on("new-room-message", this._handleNewMessage.bind(this));
        this.io.on("new-direct-message", this._handleNewMessage.bind(this));

        this.io.on("edit-room-message", this._handleEditMessage.bind(this));
        this.io.on("edit-direct-message", this._handleEditMessage.bind(this));

        this.io.on("delete-room-message", this._handleDeleteMessage.bind(this));
        this.io.on("delete-direct-message", this._handleDeleteMessage.bind(this));

        // ##################
        // ## WebRTC stuff ## ASCII Art, Yey! :D
        // ##################

        this.io.on("new-consumer", this._handleNewConsumer.bind(this));

        reaction(() => {
            return {
                audio: MyInfo.preferredInputs.audio,
                video: MyInfo.preferredInputs.video
                // no screen because we don't have a default
            }

        }, (_) => {
            log("Preferred input changed detected");
            if (
                MyInfo.preferredInputs.audio
                && MyInfo.mediasoup.producers.microphone
                && MyInfo.mediasoup.producers.microphone.track?.getSettings().deviceId !== MyInfo.preferredInputs.audio
            ) {
                log("Preferred audio input changed detected");
                (MyInfo.mediasoup.producers.microphone.track as MediaStreamTrack).stop();
                MyInfo.getStream("microphone").then((stream) => {
                    MyInfo.mediasoup.producers.microphone?.replaceTrack({track: stream.getAudioTracks()[0]});
                });
            }
            if (
                MyInfo.preferredInputs.video
                && MyInfo.mediasoup.producers.camera
                && MyInfo.mediasoup.producers.camera.track?.getSettings().deviceId !== MyInfo.preferredInputs.video
            ) {
                log("Preferred video input changed detected");
                (MyInfo.mediasoup.producers.camera.track as MediaStreamTrack).stop();

                MyInfo.getStream("camera").then((stream) => {
                    MyInfo.mediasoup.producers.camera!.replaceTrack({track: stream.getVideoTracks()[0]});
                });
            }
        });

    }

    leave() {
        if(RoomStore.room && MyInfo.info?.isHost && ParticipantsStore.getLiving(true).length > 0){
            UIStore.store.modalStore.leaveMenu = true;
        } else {
            // eslint-disable-next-line no-restricted-globals
            const confirmed = confirm("Are you sure you would like to leave this room?");
            if (confirmed) {
                this._leave();
            }
        }
    }

    _leave(){
        log("Leaving room");
        this.io.emit("leave");
        this.reset();
    }

    endRoomForAll(){
      return this.socketRequest("end-room");
    }

    async transferHost(participant: Participant){
        // TODO
    }

    reset() {
        log("Resetting stores");
        UIStore.store.modalStore.joinOrCreate = true;
        ResetStores();
    }

    createRoom(name: string) {
        log("Creating room with name %s", name);
        if(!this.io.connected){
            log("IO is not connected");
            throw "Could not connect to server";
        }
        this.io.emit("create-room", name);
    }

    joinRoom(id: string, name?: string) {
        log("Joining room with id: %s", id);
        if(!this.io.connected){
            log("IO is not connected");
            throw "Could not connect to server";
        }
        UIStore.store.modalStore.joiningRoom = true;
        this.socketRequest("get-rtp-capabilities", id)
            .then((response: APIResponse) => {
                if (!response.success) {
                    throw response.error;
                }
                RoomStore.device = new mediasoupclient.Device();
                return RoomStore.device.load({routerRtpCapabilities: response.data});
            })
            .then(() => {
                this.io.emit("join-room", id, name, RoomStore.device!.rtpCapabilities, (response: APIResponse) => {
                    if (!response.success) {
                        if (response.status !== 403) {
                            throw response.error;
                        }
                        this._handleWaitingRoomInformation(response.data);
                        return;
                    }
                    this._handleRoomSummary(response.data);
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
                NotificationStore.add(new UINotification(`Join Error: ${error}`, NotificationType.Error));
                return;
            });
    }

    createTransports() {
        log("Starting creation of transports process");
        const addTransportListeners = (transport: mediasoupclient.types.Transport) => {
            log("Adding transport");

            transport.on("connect", async ({dtlsParameters}, callback, errback) => {
                log("Transport connect event emitted");
                const response = await this.socketRequest("connect-transport", transport.id, dtlsParameters);
                if (!response.success) {
                    log("connect-transport request error");
                    NotificationStore.add(new UINotification(`An error occurred connecting to the transport: ${response.error}`, NotificationType.Error));
                    errback();
                    return;
                }
                log("connect-transport request success");
                callback();
            });

            transport.on("produce", async ({kind, rtpParameters, appData}, callback, errback) => {
                log("Producing type: %s", appData.source);
                try {
                    const response: APIResponse = await this.socketRequest("create-producer", transport.id, kind, appData.source, rtpParameters);
                    if (!response.success) {
                        errback(response.error);
                        errback(response.error);
                        return;
                    }
                    this.socketRequest("producer-action", appData.source, "resume");
                    callback({id: response.data.id});
                } catch (error) {
                    errback(error);
                }
            });
        };

        return Promise.all([
            this.socketRequest("create-transport", "webrtc", "receiving").then((response: APIResponse) => {
                MyInfo.mediasoup.transports.receiving = RoomStore.device!.createRecvTransport(response.data.transportInfo);
                return addTransportListeners(MyInfo.mediasoup.transports.receiving);
            }),
            this.socketRequest("create-transport", "webrtc", "sending").then((response: APIResponse) => {
                MyInfo.mediasoup.transports.sending = RoomStore.device!.createSendTransport(response.data.transportInfo);
                return addTransportListeners(MyInfo.mediasoup.transports.sending);
            })
        ]);

    }

    _handleKick() {
        this.reset();
        NotificationStore.add(new UINotification("You have been kicked from the room", NotificationType.Warning))
    }

    _handleJoinRoom(id: string) {
        this.joinRoom(id, MyInfo.chosenName);
    }


    @action
    _handleRoomSummary(data: { summary: RoomSummary, rtcCapabilities: any }) {
        const roomSummary = data.summary;

        const participants = roomSummary.participants.map((participantSummary: ParticipantSummary) => {
            const participant = new Participant({
                ...participantSummary,
                mediasoup: {
                    consumer: {
                        camera: null,
                        microphone: null,
                        screen: null
                    }
                }
            });
            if (participant.id === roomSummary.myId) {
                CurrentUserInformationStore.info = participant;
            }
            return participant;
        });
        ParticipantsStore.replace(participants);
        ChatStore.addParticipant(...participants);

        roomSummary.messages.forEach((message: MessageSummary) => {
            const realMessage = this.convertMessageSummaryToMessage(message);
            ChatStore.addMessage(realMessage);
        });

        RoomStore.room = roomSummary;
        RoomStore.mediasoup.rtcCapabilities = data.rtcCapabilities;
        UIStore.store.joinedDate = new Date();
    }


    convertMessageSummaryToMessage(message: MessageSummary): Message {
        const replacementObj: any = {};
        replacementObj.from = ParticipantsStore.getById(message.from) || null;
        replacementObj.to = ParticipantsStore.getById(message.to) || null;
        replacementObj.reactions = JSON.parse(JSON.stringify(message.reactions));
        replacementObj.reactions.forEach((reaction: any) => {
            reaction.participant = ParticipantsStore.getById(reaction.participant);
        });
        return Object.assign({}, message, replacementObj) as Message;
    }

    _handleNewParticipant(participantSummary: ParticipantSummary) {
        ParticipantsStore.removeFromWaitingRoom(participantSummary.id);

       /* participantSummary.mediaState = {
            camera: false,
            screen: false,
            microphone: false
        };*/

        const participant = new Participant({
            ...participantSummary,
            mediasoup: {
                consumer: {
                    camera: null,
                    screen: null,
                    microphone: null
                }
            }
        });
        ParticipantsStore.participants.push(participant);
        NotificationStore.add(new UINotification(`${participant.name} joined!`, NotificationType.Alert));
        ChatStore.addSystemMessage({content: `${participant.name} joined`});
    }

    @action
    _handleWaitingRoomNewParticipant(data: { participant: ParticipantData }) {
        ParticipantsStore.waitingRoom.push(new Participant(data.participant));
    }

    _handleMediaStateUpdate(update: MediaStateUpdate) {
        const participant = ParticipantsStore.getById(update.id);
        if (!participant) {
            return;
        }
        log("Media state update %s: %s - %s", participant.name, update.source, update.action);
        if(participant.mediasoup.consumer[update.source]){
            participant.mediasoup.consumer[update.source]![update.action]();
            if(update.action === "close"){
                participant.mediasoup.consumer[update.source] = null;
            }
        }
        participant.mediaState[update.source] = update.action === "resume";
    }

    _handleParticipantLeft(participantId: string) {
        const participant: Participant | undefined = ParticipantsStore.getById(participantId);
        if (participant) {
            participant.isAlive = false;
            ChatStore.addSystemMessage({content: `${participant.name} left`});
            NotificationStore.add(new UINotification(`${participant.name} left!`, NotificationType.Alert));
        }
        ParticipantsStore.removeFromWaitingRoom(participantId);
    }

    _handleParticipantNameChange(participantId: string, newName: string) {
        const participant = ParticipantsStore.getById(participantId);
        if (participant) {
            participant.name = newName;
        }
    }

    _handleRoomClosure() {
        NotificationStore.add(new UINotification(`Room was closed!`, NotificationType.Warning));
        ResetStores();
        UIStore.store.modalStore.joinOrCreate = true;
    }

    _handleNewMessage(messageSummary: MessageSummary) {
        const realMessage = this.convertMessageSummaryToMessage(messageSummary);
        const notification = new UINotification(realMessage.content, NotificationType.Alert, {title: realMessage.from.name});
        if (!document.hasFocus()) {
            NotificationStore.systemNotify(notification);
        } else if (!UIStore.store.chatPanel) {
            NotificationStore.add(notification);
        }
        ChatStore.addMessage(realMessage);
    }

    _handleEditMessage(messageSummary: MessageSummary) {
        ChatStore.editMessage(messageSummary.id, messageSummary.content);
    }

    _handleDeleteMessage(messageSummary: MessageSummary) {
        ChatStore.removeMessage(messageSummary.id);
    }

    async _handleNewConsumer(source: MediaSource, kind: MediaType, participantId: string, data: any, cb: Function) {
        const participant = ParticipantsStore.getById(participantId);
        if (!participant) {
            throw 'Could not find participant';
        }
        log("New Consumer for %s: %s", participant.name, source);
        participant.mediasoup!.consumer[source] = await MyInfo.mediasoup.transports.receiving!.consume({
            id: data.consumerId,
            producerId: data.producerId,
            kind: kind,
            rtpParameters: data.rtpParameters
        });

        participant.mediasoup!.consumer[source]!.on("transportclose", () => {
            participant.mediasoup!.consumer[source] = null;
        });

        cb(true);
        participant.mediasoup!.consumer[source]?.resume();
    }

    _handleWaitingRoomInformation(info: any) {
        UIStore.store.modalStore.joiningRoom = false;
        UIStore.store.modalStore.waitingRoom = true;
    }

    _handleWaitingRoomAccept(data: any) {
        NotificationStore.add(new UINotification("You were accepted into the room!", NotificationType.Success), true);
        UIStore.store.modalStore.waitingRoom = false;
        this._handleRoomSummary(data);
        this.createTransports()
            .then(() => this.io.emit("transports-ready"));
    }

    _handleWaitingRoomRejection(reason: any) {
        NotificationStore.add(new UINotification(reason, NotificationType.Error), true);
        UIStore.store.modalStore.waitingRoom = false;
        UIStore.store.modalStore.joiningRoom = false;
        UIStore.store.modalStore.join = true;
    }


    _handleUpdatedRoomSettings(newSettings: RoomSettingsObj) {
        if (RoomStore.room?.name !== newSettings.name) {
            RoomStore.room!.name = newSettings.name;
        }
    }

    async toggleMedia(source: MediaSource) {
        if (MyInfo.mediasoup.producers[source]) {
            let action: "resume" | "pause" | "close" = MyInfo.mediasoup.producers[source]!.paused ? "resume" : "pause";
            if(action === "pause" && source === "screen"){
                action = "close";
            }
            MyInfo[action](source);
            this.socketRequest("producer-action", source, action);
            return;
        }
        const stream = await MyInfo.getStream(source);
        if (!stream) {
            NotificationStore.add(new UINotification(`An error occurred accessing the ${source}`, NotificationType.Error));
            return;
        }
        log("Producing media: %s", source);
        MyInfo.mediasoup.producers[source] = await MyInfo.mediasoup.transports.sending!.produce({
            track: stream.getTracks()[0],
            appData: {source}
        });
        MyInfo.resume(source);
    }

    @action
    async send(toId: string, content: string) {
        const response = await this.socketRequest("send-message", toId, content);
        if (!response.success) {
            NotificationStore.add(new UINotification(`An error occurred sending the message: "${response.error}"`, NotificationType.Error));
            console.error("Sending Error: " + response.error);
            return false;
        }
        ChatStore.addMessage({
            id: response.data.id,
            from: MyInfo.info!,
            to: ParticipantsStore.getById(toId)!,
            content: content,
            reactions: [],
            created: response.data.created
        });
        return true;
    }

    @action
    async edit(toId: string, content: string) {
        const response = await this.socketRequest("edit-message", toId, content);

        if (!response.success) {
            NotificationStore.add(new UINotification(`An error occurred editing the message: "${response.error}"`, NotificationType.Error));
            console.error("Editing Error: " + response.error);
            return false;
        }

        ChatStore.editMessage(toId, content);
        return true;
    }

    @action
    async delete(toId: string) {
        const response = await this.socketRequest("delete-message", toId);

        if (!response.success) {
            NotificationStore.add(new UINotification(`An error occurred deleting the message: "${response.error}"`, NotificationType.Error));
            console.error("Deleting Error: " + response.error);
            return false;
        }
        ChatStore.removeMessage(toId);
        return true;
    }


    async waitingRoomDecision(id: string, accept: boolean) {
        const response = await this.socketRequest("waiting-room-decision", id, accept ? "accept" : "reject");

        if (!response.success) {
            NotificationStore.add(new UINotification(`An error occurred while deciding on waiting room member: "${response.error}"`, NotificationType.Error));
            console.error("Waiting Room Error: " + response.error);
            return false;
        }
        return true;
    }

    async changeName(newName: string) {
        const response = await this.socketRequest("change-name", newName);
        if (response.success) {
            MyInfo.info!.name = newName;
        }
    }


    async getRoomSettings(): Promise<RoomSettingsObj> {
        const response = await this.socketRequest("get-room-settings");
        if (!response.success) {
            NotificationStore.add(new UINotification("Error Getting Settings: " + response.error, NotificationType.Error))
            throw response.error;
        }
        return response.data.settings;
    }

    async changeRoomSettings(newSettings: RoomSettingsObj): Promise<undefined> {
        const response = await this.socketRequest("update-room-settings", newSettings);
        if (!response.success) {
            NotificationStore.add(new UINotification("Error Getting Settings: " + response.error, NotificationType.Error))
            throw response.error;
        }
        RoomStore.room!.name = newSettings.name;
        return;
    }

    async kick(participant: Participant): Promise<void> {
        const response = await this.socketRequest("kick-participant", participant.id);
        if (!response.success) {
            NotificationStore.add(new UINotification("Error Kicking Participant: " + response.error, NotificationType.Error))
            throw response.error;
        }
        ChatStore.addSystemMessage({content: `${participant.name} was kicked`})
        return;
    }

    socketRequest(event: string, ...args: any[]): Promise<APIResponse> {
        return new Promise(async (resolve, reject) => {
            this.io.emit(event, ...args, (json: APIResponse) => {
                resolve(json);
            });
        });
    }


}

const ioAddress = process.env.NODE_ENV === "development" ? ("http://" + window.location.hostname + ":3001") : ("https://" + window.location.hostname);

export default new IO(ioAddress);
