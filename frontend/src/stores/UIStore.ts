import {observable} from "mobx";
import UIStoreService from "../services/UIStoreService";

interface UIStoreInterface {
    chatPanel: boolean,
    participantPanel: boolean,
    modalStore: {
        joinOrCreate: boolean,
        join: boolean,
        joiningRoom: boolean,
        waitingRoom: boolean,
        create: boolean,
        settings: boolean,
        leaveMenu: boolean
    },
    preFillJoinValue: null | string,
    messageIdEditControl: null | string,
    joinedDate: null | Date,
    title: string

    [key: string]: any,
}

class UIStore {
    @observable public store: UIStoreInterface = UIStoreService.defaultProperties;
}


export default new UIStore();
