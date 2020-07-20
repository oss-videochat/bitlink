import {handleParticipantEvent} from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";
import ParticipantService from "../../services/ParticipantService";


export const handleDisconnectParticipant: handleParticipantEvent = async ({participant, room}, cb) => {
    RoomService.participantLeft(room, participant);
}
