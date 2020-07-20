import {handleSocketEvent} from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";
import debug from "../../helpers/debug";
import WorkerService from "../../services/WorkerService";
import {RoomSettings} from "../../interfaces/Room";

const log = debug("handle:CreateRoom");

interface handleCreateRoomParams {
    name: string,
}

const handleCreateRoom: handleSocketEvent<handleCreateRoomParams> = async ({name, socket}, cb) => {
    log("Creating new room");
    const router = await WorkerService.getGoodRouter();
    const defaultRoomSettings: RoomSettings = {
        name,
        waitingRoom: false
    }
    const room = RoomService.create(router, defaultRoomSettings);
    RoomService.addRoom(room);
    socket.emit("join-room", room.id);
}
export default handleCreateRoom;
