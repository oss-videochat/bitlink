import { handleEvent } from "../../interfaces/handleEvent";
import { ResetStores } from "../../util/ResetStores";
import UIStore from "../../stores/UIStore";
import NotificationService from "../../services/NotificationService";
import { NotificationType } from "../../enum/NotificationType";

export const handleRoomClosure: handleEvent = () => {
  NotificationService.add(
    NotificationService.createUINotification(`Room was closed!`, NotificationType.Warning)
  );
  ResetStores();
  UIStore.store.modalStore.joinOrCreate = true;
};
