import {ParticipantInformation} from "./ParticipantsStore";
import { observable } from "mobx";

export interface CurrentUserInformation extends ParticipantInformation{
    key: string
}


class CurrentUserInformationStore {
    get info(): CurrentUserInformation | undefined {
        return this._info;
    }

    set info(value: CurrentUserInformation | undefined) {
        this._info = value;
    }

    @observable
    private _info: CurrentUserInformation | undefined;

}

export default new CurrentUserInformationStore();
