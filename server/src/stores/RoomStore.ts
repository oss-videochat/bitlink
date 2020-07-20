import {Room} from "../interfaces/Room";

interface RoomStorage {
    [key: string]: Room
}

class RoomStore {
    rooms: RoomStorage = {};
}

export default new RoomStore();
