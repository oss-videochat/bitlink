import {handleEvent} from "../../interfaces/handleEvent";
import NotificationStore from "../../stores/NotificationStore";
import IO from "../IO";
import NotificationService from "../../services/NotificationService";
import {NotificationType} from "../../enum/NotificationType";


export const handleKick: handleEvent = () => {
    IO.reset();
    NotificationService.add(NotificationService.createUINotification("You have been kicked from the room", NotificationType.Warning))
};
