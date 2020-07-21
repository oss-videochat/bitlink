import {handleEvent} from "../../interfaces/handleEvent";
import NotificationStore, {NotificationType, UINotification} from "../../stores/NotificationStore";
import {ResetStores} from "../../util/ResetStores";
import UIStore from "../../stores/UIStore";


export const handleRoomClosure: handleEvent = () => {
    NotificationStore.add(new UINotification(`Room was closed!`, NotificationType.Warning));
    ResetStores();
    UIStore.store.modalStore.joinOrCreate = true;
};
