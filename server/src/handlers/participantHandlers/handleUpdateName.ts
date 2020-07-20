import {handleParticipantEvent} from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";

interface handleUpdateNameParams {
    name: string;
}

export const handleUpdateName: handleParticipantEvent<handleUpdateNameParams> = async ({name, participant, room}, cb) => {
    cb(RoomService.participantChangedName(room, participant, name));
};

