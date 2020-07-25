import {DirectMessage, GroupMessage, Message} from "../interfaces/Message";
import {action} from "mobx";
import ChatStore from "../stores/ChatStore";
import {MessageType} from "@bitlink/common"
import RoomStore from "../stores/RoomStore";

class ChatStoreService {
    static reset() {
        ChatStore.messageStore = [];
    }

    @action
    static addMessage(...messages: Array<Message>) {
        messages.forEach((message: Message) => {
            ChatStore.messageStore.push(message);
        });
    }

    static getMessageById(id: string) {
        return ChatStore.messageStore.find(aMessage => aMessage.id === id);
    }

    static getLatestMessage(type: MessageType.GROUP | MessageType.DIRECT, id: string) {
        return ChatStore.messageStore.slice().reverse().find(aMessage => (
            aMessage.type !== MessageType.SYSTEM
            && (type === MessageType.GROUP ? (aMessage as GroupMessage).group.id : (aMessage as DirectMessage).from.info.id) === id
        ));
    }

    @action
    static removeMessage(id: string) {
        const index = ChatStore.messageStore.findIndex(aMessage => aMessage.id === id);
        ;
        if (index) {
            ChatStore.messageStore.splice(index, 1);
        }
    }

    @action
    static editMessage(id: string, content: string) {
        const oldMessage = this.getMessageById(id);
        if (!oldMessage) {
            return;
        }
        oldMessage.content = content;
    }


    static getMessages(type: MessageType, roomId: string) {
        return ChatStore.messageStore.filter(aMessage => {
            let idMatch: boolean = false;
            if (aMessage.type === MessageType.GROUP && (aMessage as GroupMessage).group.id === roomId) {
                idMatch = true;
            }
            if (aMessage.type === MessageType.DIRECT
                && (
                    (aMessage as DirectMessage).from.info.id === roomId
                    || (aMessage as DirectMessage).to.info.id === roomId)
            ) {
                idMatch = true;
            }

            if (type === MessageType.GROUP) {
                if (RoomStore.groups[0].id === roomId && aMessage.type === MessageType.SYSTEM) {
                    return true;
                }
                return idMatch
            }
        });
    }
}

export default ChatStoreService;
