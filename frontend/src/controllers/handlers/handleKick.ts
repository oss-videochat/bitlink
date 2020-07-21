import {handleEvent} from "../../interfaces/handleEvent";
import NotificationStore, {NotificationType, UINotification} from "../../stores/NotificationStore";
import IO from "../IO";


export const handleKick: handleEvent = async () => {
    IO.reset();
    NotificationStore.add(new UINotification("You have been kicked from the room", NotificationType.Warning))
};
