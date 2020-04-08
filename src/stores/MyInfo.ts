import {ParticipantInformation} from "./ParticipantsStore";
import { observable } from "mobx";

export interface CurrentUserInformation extends ParticipantInformation {
    key: string
}


class CurrentUserInformationStore {
    @observable
    public info?: CurrentUserInformation;
    public chosenName?: string;

    reset(){
        this.chosenName = undefined;
        this.info = undefined;
    }
}

export default new CurrentUserInformationStore();
