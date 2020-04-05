import io from 'socket.io-client';
import {findById, participantStore, ParticipantInformation} from "../stores/ParticipantsStore";

import * as Event from 'events';

import {
    getMessageById,
    Message,
    messagesStore,
    MessageSummary,
    Reaction,
    ReactionSummary
} from "../stores/MessagesStore";

import CurrentUserInformationStore, {CurrentUserInformation} from "../stores/MyInfo";
import RoomStore, {RoomSummary} from "../stores/RoomStore";


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
        this.io.emit("create-room");
    }

    joinRoom(id: string) {
        this.io.emit("join-room", id);
    }

    _handleJoinRoom(id: string) {
        this.joinRoom(id);
    }

    _handleRoomSummary(roomSummary: any) {
        participantStore.replace(roomSummary.participants);

        roomSummary.participants.forEach((participant: ParticipantInformation | CurrentUserInformation) => {
            if (participant.isMe) {
                CurrentUserInformationStore.info = participant as CurrentUserInformation;
            }
        });

        roomSummary.messages.forEach((message: any) => {
            message.from = findById(message.from) || null;
            if (message.to !== "everyone") {
                message.to = findById(message.to) || null;
            }
            message.reactions.forEach((reaction: any) => {
                reaction.participant = findById(reaction.participant);
            });

            messagesStore.push(message);
        });

        RoomStore.room = roomSummary as RoomSummary;

        this.emit("room-summary", roomSummary);
    }

    _handleNewParticipant(participantSummary: ParticipantInformation) {
        this.emit("new-participant", participantSummary);
    }

    _handleRoomClosure() {
        this.emit("room-closure");
    }

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
        return true;
    }

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
        getMessageById(id)!.content = content;
        return true;
    }

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
