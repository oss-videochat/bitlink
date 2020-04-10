import {observable} from "mobx";
import {ParticipantInformation} from "./ParticipantsStore";

export enum NotificationType {
    Alert= "alert",
    Error = "error",
    Warning = "warning",
    Success = "success",
}

export class UINotification {
    public readonly created = new Date();
    private static defaultTime: number = 5000;
    public timeout = UINotification.defaultTime;
    public message: string;
    public type: NotificationType;
    public timer?: any;

    constructor(message: string, type: NotificationType, timeout?: number) {
        this.message = message;
        this.type = type;
        if (timeout) {
            this.timeout = timeout;
        }
    }
}


class NotificationStore {
    @observable public store = observable<UINotification>([]);

    add(notification: UINotification) {
        notification.timer = setTimeout(() => {
            this.store.remove(notification);
        }, (notification.created.getTime() + notification.timeout) - Date.now());
        this.store.push(notification);
    }

    reset() {
        this.store.clear();
    }
}

export default new NotificationStore();
