import {handleEvent} from "../../interfaces/handleEvent";
import NotificationStore, {NotificationType, UINotification} from "../../stores/NotificationStore";
import UIStore from "../../stores/UIStore";

interface handleWaitingRoomRejectionParam {
    reason: string
}

export const handleWaitingRoomRejection: handleEvent<handleWaitingRoomRejectionParam> = ({reason}, cb) => {
    NotificationStore.add(new UINotification(reason, NotificationType.Error), true);
    UIStore.store.modalStore.waitingRoom = false;
    UIStore.store.modalStore.joiningRoom = false;
    UIStore.store.modalStore.join = true;
};
