import {handleEvent} from "../../interfaces/handleEvent";
import {MessageGroupSummary} from "@bitlink/common";
import IO from "../IO";
import RoomStore from "../../stores/RoomStore";

interface handleAddedToGroupParam {
    groupSummary: MessageGroupSummary
}

export const handleAddedToGroup: handleEvent<handleAddedToGroupParam> = ({groupSummary}, cb) => {
    const group = IO.convertMessageGroupSummaryToMessageGroup(groupSummary);
    RoomStore.groups.push(group);
};
