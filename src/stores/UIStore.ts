import {observable} from "mobx";

interface UIStoreInterface {
    [key: string]: any,
    chatPanel: boolean,
    participantPanel: boolean,
    modalStore: {
        joinOrCreate: boolean,
        join: boolean,
        joiningRoom: boolean,
        waitingRoom: boolean,
        create: boolean,
        settings: boolean
    },
    preFillJoinValue: null | string,
    messageIdEditControl: null | string,
    joinedDate: null | Date,
    title: string
}

class UIStore {
    static defaultProperties: UIStoreInterface = {
        chatPanel: true,
        participantPanel: true,
        modalStore: {
            joinOrCreate: false,
            join: false,
            joiningRoom: false,
            waitingRoom: false,
            create: false,
            settings: false
        },
        preFillJoinValue: null,
        messageIdEditControl: null,
        joinedDate: null,
        title: "BitLink"
    };

    reset(){
        this.store = UIStore.defaultProperties;
    }

    @observable public store: UIStoreInterface = UIStore.defaultProperties;

    toggle(property: string) {
        this.store[property] = !this.store[property];
    }
}


export default new UIStore();
