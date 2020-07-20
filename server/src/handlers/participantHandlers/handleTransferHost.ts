import {handleParticipantEvent} from "../../interfaces/handleEvent";
import {ParticipantRole} from "@bitlink/common";
import RoomService from "../../services/RoomService";

interface handleTransferHostParam {
    participantId: string
}

export const handleTransferHost: handleParticipantEvent<handleTransferHostParam> = async ({participantId, participant, room}, cb) => {
    if (participant.role !== ParticipantRole.HOST) {
        cb({
            success: false,
            status: 401,
            error: "You must be a host to end the room.",
        });
        return;
    }
    const participantToHostify = RoomService.getParticipant(room, participantId);
    if (!participantToHostify || !participantToHostify.isConnected) {
        cb({
            success: false,
            status: 404,
            error: "Could not find that participant",
        });
        return;
    }
    RoomService.transferHost(room, participant, participantToHostify);
    cb({
        success: true,
        status: 200,
        error: null,
    });
};

