import ParticipantsStore, {ParticipantInformation} from "./ParticipantsStore";
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
    chatStoreKey: string,
}

class ChatStore {
    @observable public chatStore: ChatStoreObj = {};
    private messageMap: MessageStore = {};

    reset() {
        this.chatStore = {};
        this.messageMap = {};
    }

    @action
    addParticipant(...participants: Array<ParticipantInformation>) {
        participants.forEach((participant: ParticipantInformation) => {
            if (this.chatStore.hasOwnProperty(participant.id)) {
                return;
            }
            this.chatStore[participant.id] = [];
        });
    }

    participantLeft(participant: ParticipantInformation) {
        this.addMessage({
            content: `${participant.name} left`,
            created: Date.now(),
            from: ParticipantsStore.system,
            id: Math.random().toString(),
            reactions: [],
            to: ParticipantsStore.everyone
        });
    }

    participantJoined(participant: ParticipantInformation) {
        this.addMessage({
            content: `${participant.name} joined`,
            created: Date.now(),
            from: ParticipantsStore.system,
            id: Math.random().toString(),
            reactions: [],
            to: ParticipantsStore.everyone
        });
    }

    @action
    addMessage(...messages: Array<Message>) {
        messages.forEach((message: Message) => {
            const externalParticipant = ChatStore.getExternalParticipant(message);
            let key: string = externalParticipant.id;

            if (message.to.id === ParticipantsStore.everyone.id) {
                key = "everyone";
            }

            this.messageMap[message.id] = {
                chatStoreKey: key
            };

            if (this.chatStore.hasOwnProperty(key)) {
                this.chatStore[key].push(message);
            } else {
                this.chatStore[key] = [message];
            }
        });
    }

    static getExternalParticipant(message: Message): ParticipantInformation {
        if (message.from.id === MyInfo.info!.id) {
            return message.to;
        } else {
            return message.from;
        }
    }

    getMessageFromStore(store: Message[], messageId: string): Message{
        return store.find(message => message.id === messageId) as Message;
    }

    getMessageById(id: string): Message {
        const chatStoreKey = this.messageMap[id].chatStoreKey;
        return this.getMessageFromStore(this.chatStore[chatStoreKey], id);
    }

    @action
    removeMessage(id: string) {
        const message = this.messageMap[id];
        const store = this.chatStore[message.chatStoreKey];
        store.splice(store.findIndex(storeMessage => storeMessage.id === id), 1);
        delete this.messageMap[id];
    }

    @action
    editMessage(id: string, content: string) {
        const oldMessage = this.getMessageById(id);
        oldMessage.content = content;
    }
}

export default new ChatStore();
