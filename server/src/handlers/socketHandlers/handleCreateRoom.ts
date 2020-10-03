import { handleSocketEvent } from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";
import debug from "../../helpers/debug";
import WorkerService from "../../services/WorkerService";
import { HostDisconnectAction, RoomSettings } from "@bitlink/common";

const log = debug("handle:CreateRoom");

interface handleCreateRoomParams {
    name: string;
}

const handleCreateRoom: handleSocketEvent<handleCreateRoomParams> = async (
    { name, socket },
    cb
) => {
    log("Creating new room");
    const router = await WorkerService.getGoodRouter();
    const defaultRoomSettings: RoomSettings = {
        name,
        waitingRoom: false,
        hostDisconnectAction: HostDisconnectAction.TRANSFER_HOST,
    };
    const room = RoomService.create(router, defaultRoomSettings);
    RoomService.addRoom(room);
    socket.emit("join-room", { id: room.id });
};
export default handleCreateRoom;
