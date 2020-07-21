import {handleEvent} from "../../interfaces/handleEvent";
import IO from "../IO";
import MyInfo from "../../stores/MyInfo";

interface handleJoinRoomParam {
    id: string
}

export const handleJoinRoom: handleEvent<handleJoinRoomParam>= async ({id}) => {
    IO.joinRoom(id, MyInfo.chosenName);
};
