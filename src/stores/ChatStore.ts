import {ParticipantInformation} from "./ParticipantsStore";
import {observable, action} from "mobx";
import {Message} from "./MessagesStore";
import MyInfo from "./MyInfo";

export interface ChatStoreObj {
    [key: string]: Array<Message>
}

interface MessageStore {
    [key: string]: MessageStoreObject
}

interface MessageStoreObject {
    message: Message,
    chatStoreKey: string,
}

class ChatStore {
    @observable public chatStore: ChatStoreObj = {};
    private messageStore: MessageStore = {};

    @action
    addParticipant(...participants: Array<ParticipantInformation>) {
        participants.forEach((participant: ParticipantInformation) => {
            if (this.chatStore.hasOwnProperty(participant.id)) {
                return;
            }
            this.chatStore[participant.id] = [];
        });
    }

    @action
    addMessage(...messages: Array<Message>) {
        messages.forEach((message: Message) => {
            const externalParticipant = ChatStore.getExternalParticipant(message);
            let key: string;
            if (typeof externalParticipant === "string") {
                key = externalParticipant;
            } else {
                key = externalParticipant.id;
            }
            if(message.to === "everyone"){
                key = "everyone";
            }
            this.messageStore[message.id] = {
                message: message,
                chatStoreKey: key
            };
            if (this.chatStore.hasOwnProperty(key)) {
                this.chatStore[key].push(message);
            } else {
                this.chatStore[key] = [message];
            }
        });
    }

    static getExternalParticipant(message: Message): ParticipantInformation | "everyone" {
        if (message.from.id === MyInfo.info?.id) {
            return message.to;
        } else {
            return message.from;
        }
    }

    getMessageById(id: string): Message {
        return this.messageStore[id].message;
    }

    @action
    removeMessage(id: string) {
        const message = this.messageStore[id];
        const store = this.chatStore[message.chatStoreKey];
        store.splice(store.indexOf(message.message), 1);
        delete this.messageStore[id];
    }

    @action
    editMessage(message: Message) {
        const oldMessage = this.getMessageById(message.id);
        oldMessage.content = message.content;
    }
}

export default new ChatStore();
