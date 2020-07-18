import {handleParticipantEvent} from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";
import ParticipantService from "../../services/ParticipantService";


const handleDisconnectParticipant: handleParticipantEvent = async ({participant, room}, cb) => {
    ParticipantService.disconnect(participant);
    RoomService.participantLeft(room, participant);
}
export default handleDisconnectParticipant;
