import ParticipantsStore from "./ParticipantsStore";
import {action, observable} from "mobx";
import {Message} from "./MessagesStore";
import MyInfo from "./MyInfo";
import UIStore from "./UIStore";
import Participant from "../components/models/Participant";

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

    static getExternalParticipant(message: Message): Participant {
        if (message.from.id === MyInfo.info!.id) {
            return message.to;
        } else {
            return message.from;
        }
    }

    reset() {
        this.chatStore = {};
        this.messageMap = {};
    }

    @action
    addParticipant(...participants: Array<Participant>) {
        participants.forEach((participant: Participant) => {
            if (this.chatStore.hasOwnProperty(participant.id)) {
                return;
            }
            this.chatStore[participant.id] = [];
        });
    }

    addSystemMessage(options: { content: string }) {
        this.addMessage({
            created: Date.now(),
            from: ParticipantsStore.system,
            id: Math.random().toString(),
            reactions: [],
            to: ParticipantsStore.everyone,
            ...options,
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

    getMessageFromStore(store: Message[], messageId: string): Message {
        return store.find(message => message.id === messageId) as Message;
    }

    getMessageIndexFromStore(store: Message[], messageId: string): number {
        return store.findIndex(message => message.id === messageId);
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

    editNextMessage(options: { messageId?: string, selectedUser?: string }) {
        if (!options.messageId && !options.selectedUser) {
            throw "Can't edit next message"
        }
        if (options.messageId) {
            const message = this.messageMap[options.messageId];
            const store = this.chatStore[message.chatStoreKey];
            const index = this.getMessageIndexFromStore(store, options.messageId);
            const newIndex = Math.max(0, index - 1);
            UIStore.store.messageIdEditControl = store[newIndex].id;
        } else {
            const store = this.chatStore[options.selectedUser!];
            if (store && store[0]) {
                UIStore.store.messageIdEditControl = store[store.length - 1].id;
            }
        }
    }

    editPreviewMessage(messageId: string) {
        const message = this.messageMap[messageId];
        const store = this.chatStore[message.chatStoreKey];
        const index = this.getMessageIndexFromStore(store, messageId);
        const newIndex = Math.min(store.length - 1, index + 1);
        UIStore.store.messageIdEditControl = store[newIndex].id;
    }
}

export default new ChatStore();
