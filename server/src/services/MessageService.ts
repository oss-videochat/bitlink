import {DirectMessage, GroupMessage, Message, SystemMessage} from "../interfaces/Message";
import {Participant} from "../interfaces/Participant";
import {Room} from "../interfaces/Room";
import {MessageType, MessageSummary, GroupMessageSummary, DirectMessageSummary, SystemMessageSummary} from "@bitlink/common";
import RoomService from "./RoomService";

class MessageService {
    static hasPermissionToView(message: Message, participant: Participant) {
        if(message.type === MessageType.GROUP){
            return MessageService.isParticipantPartOfMessagingGroup((message as GroupMessage), participant)
        }
        if(message.type === MessageType.DIRECT){
           const directMessage = message as DirectMessage;
           return  directMessage.from === participant || directMessage.to === participant;
        }
        if(message.type === MessageType.SYSTEM){
            return participant.role <= (message as SystemMessage).permission;
        }
        throw "Unexpected message type";
    }

    static isParticipantPartOfMessagingGroup(message: GroupMessage, participant: Participant){
        return message.group.members.includes(participant);
    }

    static getSummary(message: Message): MessageSummary {
        const common = {
            id: message.id,
            content: message.content,
            created: message.created.getTime(),
            type: message.type
        };

        if(message.type === MessageType.GROUP){
            const groupMessage = message as GroupMessage;
            return {
                ...common,
                group: groupMessage.group.id,
                from: groupMessage.from.id,
            } as GroupMessageSummary;
        }
        if(message.type === MessageType.DIRECT){
            const directMessage = message as DirectMessage;
            return {
                ...common,
                to: directMessage.to.id,
                from: directMessage.from.id,
            } as DirectMessageSummary;
        }
        if(message.type === MessageType.SYSTEM){
            const systemMessage = message as SystemMessage;
            return {
                ...common,
                permissions: systemMessage.permission,
                content: systemMessage.content
            } as SystemMessageSummary;

        }
        throw "Unexpected message type";
    }
}
export default MessageService;
