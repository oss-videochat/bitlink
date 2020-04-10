import * as Event from 'events'
import Participant from "./Participant";
import Message from "./Message";
import {APIResponse, APIResponseCallback} from "./APIResponse";

interface ParticipantAuthObj {
    id: string,
    key: string
}

class Room extends Event.EventEmitter {

    public id: string;
    public name: string;
    public idHash: string;
    private readonly participants: Array<Participant> = [];
    private readonly messages: Array<Message> = []; // TODO mongodb
    private configuration;
    public readonly created;

    constructor(name: string = "Untitled Room") {
        super();

        this.name = name;
        this.created = new Date();
        setTimeout(() => {
            if (this.participants.length === 0) {
                this.destroy();
            }
        }, 10000); // user has 10 seconds to join the room they created before it will be destroyed
    }

    addParticipant(participant: Participant, cb: APIResponseCallback) {
        this.addListeners(participant);

        if (this.participants.length === 0) {
            this.addHostListeners(participant);
        }
        this.participants.push(participant);

        cb({success: true, error: null, status: 200, data: this.getSummary(participant)});

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

    addListeners(participant: Participant) {
        participant.on("leave", () => {
            this.leaveParticipant(participant);
            if (this.participants.length === 0 || participant.isHost) {
                this.destroy();
            }
        });
        participant.on("update-settings", () => {
            this.broadcast("participant-updated-settings", [participant],
                {
                    id: participant.id,
                    settings: participant.settings
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


        /* participant.socket.on("video-data", data => {
             //      console.log("Receive server: " + data.length + " - " + participant.id);
             this.broadcast("video-data", [participant], data);
         });
         */
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

    getSummary(currentParticipant?: Participant) {
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

}

export default Room;
