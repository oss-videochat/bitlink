import {ParticipantInformation} from "./ParticipantsStore";
import { observable } from "mobx";
import {MessageSummary} from "./MessagesStore";

export interface RoomSummary {
    id: string,
    idHash: string,
    participants: Array<ParticipantInformation>,
    messages: Array<MessageSummary>
}

class RoomStore {
    get room(): RoomSummary | undefined {
        return this._room;
    }

    set room(value: RoomSummary | undefined) {
        this._room = value;
    }

    @observable
    private _room: RoomSummary | undefined;

}

export default new RoomStore();
