import {handleParticipantEvent} from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";


export const handleDisconnectParticipant: handleParticipantEvent = async ({participant, room}, cb) => {
    RoomService.participantLeft(room, participant);
}
