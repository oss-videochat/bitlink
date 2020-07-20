import {handleParticipantEvent} from "../../interfaces/handleEvent";
import {DirectMessageInput, GroupMessageInput, MessageInput, MessageType} from "@bitlink/common";
import {MessageSummaryValidation} from "../../helpers/validation/MessageSummaryValidation";
import RoomService from "../../services/RoomService";
import MessageService from "../../services/MessageService";
import {Message} from "../../interfaces/Message";

interface handleSendMessageParam {
    messageInput: MessageInput
}

export const handleSendMessage: handleParticipantEvent<handleSendMessageParam> = async ({messageInput, participant, room}, cb) => {
    if (!MessageSummaryValidation(messageInput, messageInput.type)) {
        return cb({
            success: false,
            status: 400,
            error: "Bad input"
        });
    }
    if (messageInput.type !== MessageType.DIRECT && messageInput.type !== MessageType.GROUP) { // TODO redundant
        return cb({
            success: false,
            status: 400,
            error: "Users cannot produce system messages"
        });
    }
    let message: Message;
    if (messageInput.type === MessageType.DIRECT) {
        const toParticipant = RoomService.getParticipant(room, (messageInput as DirectMessageInput).to);
        if (!toParticipant) {
            return cb({
                success: false,
                status: 400,
                error: "Bad input"
            });
        }
        message = MessageService.create(messageInput, participant, {to: toParticipant});
    } else {
        const toGroup = RoomService.getGroup(room, (messageInput as GroupMessageInput).group);
        if (!toGroup) {
            return cb({
                success: false,
                status: 400,
                error: "Bad input"
            });
        }
        message = MessageService.create(messageInput, participant, {group: toGroup});

    }
    // TODO throttle
    RoomService.sendMessage(room, message);
    cb({
        success: true,
        status: 400,
        error: null
    });
};

