import {Message} from "../interfaces/Message";
import {action} from "mobx";
import ChatStore from "../stores/ChatStore";

class ChatStoreService {
    static reset() {
        ChatStore.messageStore = {};
    }

    @action
    static addMessage(...messages: Array<Message>) {
        messages.forEach((message: Message) => {
            ChatStore.messageStore[message.id] = message;
        });
    }

    static getMessageById(id: string): Message {
        return ChatStore.messageStore[id];
    }

    @action
    static removeMessage(id: string) {
        delete ChatStore.messageStore[id];
    }

    @action
    static editMessage(id: string, content: string) {
        const oldMessage = this.getMessageById(id);
        oldMessage.content = content;
    }
}

export default ChatStoreService;
