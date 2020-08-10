import UIStore from "../stores/UIStore";
import {TileDisplayMode} from "../enum/TileDisplayMode";

class UIStoreService {
    static get defaultProperties() {
        return {
            chatPanel: !window.matchMedia('(max-width: 600px)').matches,
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
            title: "BitLink",
            layout: {
                mode: TileDisplayMode.GRID,
                participant: null
            }
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
