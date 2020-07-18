import {handleParticipantEvent} from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";
import ParticipantService from "../../services/ParticipantService";

interface handleUpdateNameParams {
    name: string;
}

const handleUpdateName: handleParticipantEvent<handleUpdateNameParams> = async ({name, participant, room}, cb) => {
    cb(RoomService.participantChangedName(room, participant, name));
};
export default handleUpdateName;