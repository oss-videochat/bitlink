import {handleParticipantEvent} from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";

interface handleUpdateNameParams {
    newName: string;
}

export const handleUpdateName: handleParticipantEvent<handleUpdateNameParams> = ({newName, participant, room}, cb) => {
    cb(RoomService.participantChangedName(room, participant, newName));
};

