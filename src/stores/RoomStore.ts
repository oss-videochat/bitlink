import {ParticipantInformation} from "./ParticipantsStore";
import {observable} from "mobx";
import {MessageSummary} from "./MessagesStore";

export interface RoomSummary {
    id: string,
    idHash: string,
    name: string,
    participants: Array<ParticipantInformation>,
    messages: Array<MessageSummary>
}

class RoomStore {
    @observable public room?: RoomSummary;

    reset(){
        this.room = undefined;
    }
}

export default new RoomStore();
