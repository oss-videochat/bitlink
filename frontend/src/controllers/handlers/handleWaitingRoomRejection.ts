import {handleEvent} from "../../interfaces/handleEvent";
import NotificationStore from "../../stores/NotificationStore";
import UIStore from "../../stores/UIStore";
import NotificationService from "../../services/NotificationService";
import {NotificationType} from "../../enum/NotificationType";

interface handleWaitingRoomRejectionParam {
    reason: string
}

export const handleWaitingRoomRejection: handleEvent<handleWaitingRoomRejectionParam> = ({reason}, cb) => {
    NotificationService.add(NotificationService.createUINotification(reason, NotificationType.Error), true);
    UIStore.store.modalStore.waitingRoom = false;
    UIStore.store.modalStore.joiningRoom = false;
    UIStore.store.modalStore.join = true;
};
