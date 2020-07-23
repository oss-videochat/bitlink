import {observable} from "mobx"
import Participant from "../models/Participant";
import {ParticipantRole} from "@bitlink/common";
import MyInfo from "./MyInfoStore";

class ParticipantsStore {
    @observable public participants: Participant[] = [];
    @observable public waitingRoom: Participant[] = [];
}


export default new ParticipantsStore();
