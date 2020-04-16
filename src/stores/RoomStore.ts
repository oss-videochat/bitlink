import {ParticipantInformation} from "./ParticipantsStore";
import {observable} from "mobx";
import {MessageSummary} from "./MessagesStore";
import * as mediasoupclient from 'mediasoup-client';

export interface RoomSummary {
    id: string,
    idHash: string,
    name: string,
    participants: Array<ParticipantInformation>,
    messages: Array<MessageSummary>,
}

class RoomStore {
    @observable public room?: RoomSummary;

    public device?: mediasoupclient.types.Device = new mediasoupclient.Device();

    public mediasoup =  {
        rtcCapabilities: null,
    };

    reset(){
        this.room = undefined;
    }
}

export default new RoomStore();
