import {observable} from "mobx";

interface UIStoreInterface {
    [key: string]: any
}

class UIStore {
    @observable public store: UIStoreInterface = {
        chatPanel: true,
        participantPanel: true
    };

    toggle(property: string) {
        this.store[property] = !this.store[property];
    }
}


export default new UIStore();
