import * as mediasoup from "mediasoup";
import {Room} from "../interfaces/Room";

interface RoomStorage {
    [key: string]: Room
}

class RoomStore {
    room: RoomStorage = {};
}

export default new RoomStore();
