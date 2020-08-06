import * as mediasoupclient from "mediasoup-client";
import RoomStore from "../stores/RoomStore";

class RoomService {
    static reset() {
        RoomStore.info = undefined;
        RoomStore.device = new mediasoupclient.Device();
        RoomStore.mediasoup = {
            rtcCapabilities: null,
        };
        RoomStore.groups = [];
    }

    static getGroup(groupId: string) {
        return RoomStore.groups.find(group => group.id === groupId);
    }
}

export default RoomService;
