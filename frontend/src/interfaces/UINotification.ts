import { NotificationType } from "../enum/NotificationType";
import Timeout = NodeJS.Timeout;

export interface UINotificationOptions {
    timeout: number;
    title: string;
}

export interface UINotification {
    created: Date;
    message: string;
    type: NotificationType;
    timer: null | Timeout;
    options: UINotificationOptions;
}
