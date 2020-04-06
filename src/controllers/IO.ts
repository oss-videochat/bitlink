import io from 'socket.io-client';
import ParticipantsStore, {ParticipantInformation} from "../stores/ParticipantsStore";
import {action} from 'mobx';
import * as Event from 'events';

import CurrentUserInformationStore, {CurrentUserInformation} from "../stores/MyInfo";
import RoomStore, {RoomSummary} from "../stores/RoomStore";
import MessagesStore from "../stores/MessagesStore";
import MyInfo from "../stores/MyInfo";


interface APIResponse {
    success: boolean,
    error: string | null,
    data?: any
}

class IO extends Event.EventEmitter {
    private io: SocketIOClient.Socket;

    constructor(ioAddress: string) {
        super();
        this.io = io(ioAddress);

        this.io.on("join-room", this._handleJoinRoom.bind(this));
        this.io.on("room-summary", this._handleRoomSummary.bind(this));
        this.io.on("new-participant", this._handleNewParticipant.bind(this));
        this.io.on("destroy", this._handleRoomClosure.bind(this));

    }

    createRoom() {
        console.log("Creating room...");
        this.io.emit("create-room");
    }

    joinRoom(id: string) {
        console.log("Joining room " + id + "...");
        this.io.emit("join-room", id);
    }

    _handleJoinRoom(id: string) {
        this.joinRoom(id);
    }

    @action
    _handleRoomSummary(roomSummary: any) {
        ParticipantsStore.participants.replace(roomSummary.participants);

        roomSummary.participants.forEach((participant: ParticipantInformation | CurrentUserInformation) => {
            if (participant.isMe) {
                CurrentUserInformationStore.info = participant as CurrentUserInformation;
            }
        });

        roomSummary.messages.forEach((message: any) => {
            message.from = ParticipantsStore.getById(message.from) || null;
            if (message.to !== "everyone") {
                message.to = ParticipantsStore.getById(message.to) || null;
            }
            message.reactions.forEach((reaction: any) => {
                reaction.participant = ParticipantsStore.getById(reaction.participant);
            });

            MessagesStore.messages.push(message);
        });

        RoomStore.room = roomSummary as RoomSummary;

        this.emit("room-summary", roomSummary);
    }

    _handleNewParticipant(participantSummary: ParticipantInformation) {
        ParticipantsStore.participants.push(participantSummary);
        this.emit("new-participant", participantSummary);
    }

    _handleRoomClosure() {
        this.emit("room-closure");
    }

    @action
    async sendDirect(to: ParticipantInformation, content: string) {
        const response = await this.apiRequest("send", {
            from: {
                id: CurrentUserInformationStore.info?.id,
                key: CurrentUserInformationStore.info?.key
            },
            to: to.id,
            content
        });
        if (!response.success) {
            throw response.error;
        }
        return true;
    }

    @action
    async sendToRoom(content: string) {
        const response = await this.apiRequest("send", {
            from: {
                id: CurrentUserInformationStore.info?.id,
                key: CurrentUserInformationStore.info?.key
            },
            to: "everyone",
            content
        });
        if (!response.success) {
            throw response.error;
        }
        MessagesStore.messages.push({
            id: response.data.id,
            from: MyInfo.info!,
            to: "everyone",
            content: content,
            reactions: []
        });
        return true;
    }

    @action
    async edit(id: string, content: string) {
        const response = await this.apiRequest("edit", {
            from: {
                id: CurrentUserInformationStore.info?.id,
                key: CurrentUserInformationStore.info?.key
            },
            messageId: id,
            content
        });
        if (!response.success) {
            throw response.error;
        }
        const message = MessagesStore.getMessageById(id);
        if (!message) {
            return true;
        }
        message.content = content;
        return true;
    }

    @action
    async delete(id: string, content: string) {
        const response = await this.apiRequest("delete", {
            from: {
                id: CurrentUserInformationStore.info?.id,
                key: CurrentUserInformationStore.info?.key
            },
            messageId: id,
        });
        if (!response.success) {
            throw response.error;
        }
        const messageIndex = MessagesStore.getIndexMessageById(id);
        if (!messageIndex) {
            return true;
        }
        MessagesStore.messages.splice(messageIndex, 1);
        return true;
    }

    apiRequest(url: string, body: Object): Promise<APIResponse> {
        return new Promise(async (resolve, reject) => {
            const resp = await fetch(`/api/${RoomStore.room?.idHash}/${url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });
            const data = resp.json();
            resolve(data);
        });
    }

}

export default new IO("http://127.0.0.1:3001");
