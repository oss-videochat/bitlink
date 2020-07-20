import {handleParticipantEvent} from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";
import ParticipantService from "../../services/ParticipantService";

interface handleWaitingRoomDecisionParams {
    id: string,
    decision: "accept" | "reject"
}

export const handleWaitingRoomDecision: handleParticipantEvent<handleWaitingRoomDecisionParams> = async ({id, decision, participant, room}, cb) => {
    cb(RoomService.waitingRoomDecision(room, participant, id, decision));
};

