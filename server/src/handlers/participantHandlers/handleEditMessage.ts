import { handleParticipantEvent } from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";
import { MessageType } from "@bitlink/common";
import { DirectMessage, GroupMessage } from "../../interfaces/Message";

interface handleEditMessageParam {
    messageId: string;
    newContent: string;
}

export const handleEditMessage: handleParticipantEvent<handleEditMessageParam> = async (
    { messageId, newContent, room, participant },
    cb
) => {
    const message = RoomService.getMessage(room, messageId);
    if (!message) {
        return cb({ success: false, error: "Could not find message", status: 404 });
    }
    if (
        (message.type !== MessageType.DIRECT && message.type !== MessageType.GROUP) ||
        (message as GroupMessage | DirectMessage).from.id !== participant.id
    ) {
        return cb({
            success: false,
            error: "You are not authorized to preform this action",
            status: 403,
        });
    }
    RoomService.editMessage(room, message, newContent);
    cb({ success: true, error: null, status: 200 });
};
