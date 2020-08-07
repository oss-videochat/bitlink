import {handleEvent} from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";

interface handleGroupUpdateNameParam {
    groupId: string,
    newName: string
}

export const handleGroupUpdateName: handleEvent<handleGroupUpdateNameParam> = ({groupId, newName}) => {
    const group = RoomService.getGroup(groupId);
    if (group) {
        group.name = newName;
    }
};
