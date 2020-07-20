import {DirectMessage, GroupMessage, Message, SystemMessage} from "../interfaces/Message";
import {Participant} from "../interfaces/Participant";
import {
    DirectMessageSummary,
    GroupMessageSummary,
    MessageInput,
    MessageSummary,
    MessageType,
    ParticipantRole,
    SystemMessageSummary
} from "@bitlink/common";
import {v4 as uuidv4} from "uuid";
import {MessageGroup} from "../interfaces/MessageGroup";

class MessageService {
    static create(outline: MessageInput, from: Participant, options: { permission?: ParticipantRole, group?: MessageGroup, to?: Participant }): Message {
        const common: Message = {
            id: uuidv4(),
            created: new Date(),
            type: outline.type,
            content: outline.content
        };

        switch (outline.type) {
            case MessageType.SYSTEM: {
                return {
                    ...common,
                    permission: options.permission
                } as SystemMessage
            }
            case MessageType.GROUP: {
                return {
                    ...common,
                    group: options.group,
                    from: from
                } as GroupMessage
            }
            case MessageType.DIRECT: {
                return {
                    ...common,
                    from: from,
                    to: options.to
                } as DirectMessage
            }
            default: {
                throw "Unknown type"
            }
        }
    }

    static hasPermissionToView(message: Message, participant: Participant) {
        if (message.type === MessageType.GROUP) {
            return MessageService.isParticipantPartOfMessagingGroup((message as GroupMessage), participant)
        }
        if (message.type === MessageType.DIRECT) {
            const directMessage = message as DirectMessage;
            return directMessage.from === participant || directMessage.to === participant;
        }
        if (message.type === MessageType.SYSTEM) {
            return participant.role <= (message as SystemMessage).permission;
        }
        throw "Unexpected message type";
    }

    static isParticipantPartOfMessagingGroup(message: GroupMessage, participant: Participant) {
        return message.group.members.includes(participant);
    }

    static getSummary(message: Message): MessageSummary {
        const common = {
            id: message.id,
            content: message.content,
            created: message.created.getTime(),
            type: message.type
        };

        if (message.type === MessageType.GROUP) {
            const groupMessage = message as GroupMessage;
            return {
                ...common,
                group: groupMessage.group.id,
                from: groupMessage.from.id,
            } as GroupMessageSummary;
        }
        if (message.type === MessageType.DIRECT) {
            const directMessage = message as DirectMessage;
            return {
                ...common,
                to: directMessage.to.id,
                from: directMessage.from.id,
            } as DirectMessageSummary;
        }
        if (message.type === MessageType.SYSTEM) {
            const systemMessage = message as SystemMessage;
            return {
                ...common,
                permission: systemMessage.permission,
                content: systemMessage.content
            } as SystemMessageSummary;

        }
        throw "Unexpected message type";
    }
}

export default MessageService;
