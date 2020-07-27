import {observable} from "mobx"
import Participant from "../models/Participant";

class ParticipantsStore {
    @observable public participants: Participant[] = [];
    @observable public waitingRoom: Participant[] = [];
}


export default new ParticipantsStore();
