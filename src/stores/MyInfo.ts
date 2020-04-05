import {ParticipantInformation} from "./ParticipantsStore";
import { observable } from "mobx";

export interface CurrentUserInformation extends ParticipantInformation{
    key: string
}


class CurrentUserInformationStore {
    @observable
    public info?: CurrentUserInformation;
}

export default new CurrentUserInformationStore();
