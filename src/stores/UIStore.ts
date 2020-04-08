import {observable} from "mobx";

interface UIStoreInterface {
    [key: string]: any
}

class UIStore {
    static defaultProperties: UIStoreInterface = {
        chatPanel: true,
        participantPanel: true,
        modalStore: {
            joinOrCreate: false,
            join: false,
            create: false,
        },
        preFillJoinValue: null,
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
