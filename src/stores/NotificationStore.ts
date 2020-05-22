import {observable} from "mobx";

export enum NotificationType {
    Alert = "alert",
    Error = "error",
    Warning = "warning",
    Success = "success",
}

export interface UINotificationOptions {
    timeout: number,
    title?: String
}

export class UINotification {
    private static defaultTime: number = 5000;
    public readonly created = new Date();
    public message: string;
    public type: NotificationType;
    public timer?: any;

    public options: UINotificationOptions = {
        timeout: UINotification.defaultTime,
    };

    constructor(message: string, type: NotificationType, options: UINotificationOptions | {} = {}) {
        this.message = message;
        this.type = type;

        Object.assign(this.options, options);
    }
}


class NotificationStore {
    @observable public store = observable<UINotification>([]);

    add(notification: UINotification, systemNotification = false) {
        notification.timer = setTimeout(() => {
            this.store.remove(notification);
        }, (notification.created.getTime() + notification.options.timeout) - Date.now());
        this.store.push(notification);
        if (systemNotification) {
            this.systemNotify(notification);
        }
    }

    systemNotify(notification: UINotification) {
        if (!("Notification" in window)) {
            return;
        }
        if (Notification.permission !== "granted" || document.hasFocus()) {
            return;
        }
        const title: any = notification.options.title || "BitLink";

        new Notification(title, {
            body: notification.message
        });
    }

    reset() {
        this.store.clear();
    }

    requestPermission() {
        if (!("Notification" in window)) {
            return;
        }
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }
}

export default new NotificationStore();
