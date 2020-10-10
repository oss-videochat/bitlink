import { handleEvent } from "../../interfaces/handleEvent";
import UIStore from "../../stores/UIStore";

export const handleDisconnect: handleEvent = () => {
    UIStore.store.modalStore.disconnected = true;
};
