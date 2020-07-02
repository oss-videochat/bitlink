import {observable} from "mobx";
import {MessageSummary} from "./MessagesStore";
import * as mediasoupclient from 'mediasoup-client';
import Participant from "../components/models/Participant";

export interface RoomSummary {
    id: string,
    idHash: string,
    name: string,
    myId: string
    participants: Array<Participant>,
    messages: Array<MessageSummary>,
}

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
