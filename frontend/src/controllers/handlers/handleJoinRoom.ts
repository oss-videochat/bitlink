import { handleEvent } from "../../interfaces/handleEvent";
import IO from "../IO";
import MyInfo from "../../stores/MyInfoStore";

interface handleJoinRoomParam {
  id: string;
}

export const handleJoinRoom: handleEvent<handleJoinRoomParam> = ({ id }) => {
  IO.joinRoom(id, MyInfo.chosenName);
};
