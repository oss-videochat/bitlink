import {handleParticipantEvent} from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";
import {ParticipantRole} from "@bitlink/common";

interface handleKickParticipantParam {
    participantId: string
}

export const handleKickParticipant: handleParticipantEvent<handleKickParticipantParam> = ({participantId, room, participant}, cb) => {
    if (participant.role === ParticipantRole.HOST) {
        cb({
            success: false,
            status: 403,
            error: "You are not a host"
        });
        return;
    }
    const participantToRemove = RoomService.getParticipant(room, participantId);
    if (!participantToRemove || !participantToRemove.isConnected) {
        cb({
            success: false,
            status: 404,
            error: "Could not find that participant",
        });
        return;
    }
    RoomService.kickParticipant(room, participantToRemove)
    cb({
        success: true,
        status: 200,
        error: null
    });
};

