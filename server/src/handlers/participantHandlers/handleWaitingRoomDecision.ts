import {handleParticipantEvent} from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";

interface handleWaitingRoomDecisionParams {
    id: string,
    decision: "accept" | "reject"
}

export const handleWaitingRoomDecision: handleParticipantEvent<handleWaitingRoomDecisionParams> = async ({id, decision, participant, room}, cb) => {
    cb(RoomService.waitingRoomDecision(room, participant, id, decision));
};

