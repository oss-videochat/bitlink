import UIStore from "../stores/UIStore";

class UIStoreService {
    static get defaultProperties() {
        return {
            chatPanel: true,
            participantPanel: true,
            modalStore: {
                joinOrCreate: false,
                join: false,
                joiningRoom: false,
                waitingRoom: false,
                create: false,
                settings: false,
                leaveMenu: false
            },
            preFillJoinValue: null,
            messageIdEditControl: null,
            joinedDate: null,
            title: "BitLink"
        };
    }
    static reset() {
        UIStore.store = UIStoreService.defaultProperties;
    }

    static toggle(property: string) {
        UIStore.store[property] = !UIStore.store[property];
    }
}
export default UIStoreService;
