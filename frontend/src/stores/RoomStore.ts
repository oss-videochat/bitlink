import {observable} from "mobx";
import {MessageSummary, RoomSummary} from "@bitlink/common";
import * as mediasoupclient from 'mediasoup-client';
import Participant from "../models/Participant";

class RoomStore {
    @observable public room?: RoomSummary;

    public device?: mediasoupclient.types.Device = new mediasoupclient.Device();

    public mediasoup = {
        rtcCapabilities: null,
    };

    reset() {
        this.room = undefined;
        this.device = new mediasoupclient.Device();
        this.mediasoup = {
            rtcCapabilities: null,
        };
    }
}

export default new RoomStore();
