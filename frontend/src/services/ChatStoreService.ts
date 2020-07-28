import {DirectMessage, GroupMessage, Message} from "../interfaces/Message";
import {action} from "mobx";
import ChatStore from "../stores/ChatStore";
import {MessageType} from "@bitlink/common"
import RoomStore from "../stores/RoomStore";
import MyInfoStore from "../stores/MyInfoStore";
import UIStore from "../stores/UIStore";

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
            && type === aMessage.type
            && (type === MessageType.GROUP ?
                    (aMessage as GroupMessage).group.id === id
                    : (
                        (aMessage as DirectMessage).from.info.id === id
                        || (aMessage as DirectMessage).to.info.id === id
                    )
            )
        ));
    }

    @action
    static removeMessage(id: string) {
        const index = ChatStore.messageStore.findIndex(aMessage => aMessage.id === id);
        if (index >= 0) {
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
            let idMatch = false;
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
                if (RoomStore.groups[0]?.id === roomId && aMessage.type === MessageType.SYSTEM) {
                    return true;
                }
                return idMatch
            }
            return idMatch;
        });
    }

    static editNextMessage(type: MessageType, roomId: string, message?: Message) {
        const messagesInChat = ChatStoreService.getMessages(type, roomId);
        if(!message){
            UIStore.store.messageIdEditControl = messagesInChat[messagesInChat.length - 1]?.id || null;
            return;
        }
        const nextEditableMessage = ChatStoreService.getNextEditableMessage(messagesInChat.slice().reverse(), message);
        if(nextEditableMessage){
            UIStore.store.messageIdEditControl = nextEditableMessage.id;
        }
    }

    static editPreviousMessage(type: MessageType, roomId: string, message: Message) {
        const messagesInChat = ChatStoreService.getMessages(type, roomId);
        const previousMessage = ChatStoreService.getNextEditableMessage(messagesInChat, message);
        if(previousMessage){
            UIStore.store.messageIdEditControl = previousMessage.id;
        }
    }

    private static getNextEditableMessage(messages: Message[], message: Message){
        let hit = false;
        return messages.find(messageInChat => {
            if(messageInChat.type !== MessageType.DIRECT && messageInChat.type !== MessageType.GROUP){ // you can't edit a system message
                return false;
            }
            const userMessageInChat = messageInChat as GroupMessage | DirectMessage;
            if(hit
                && userMessageInChat.from.info.id === MyInfoStore.participant!.id){ // must be editable
                return true;
            }
            if(messageInChat.id === message.id){
                hit = true;
            }
            return false;
        });
    }
}

export default ChatStoreService;
