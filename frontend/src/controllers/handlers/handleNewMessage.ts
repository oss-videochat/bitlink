import { handleEvent } from "../../interfaces/handleEvent";
import { MessageSummary, MessageType } from "@bitlink/common";
import UIStore from "../../stores/UIStore";
import IO from "../IO";
import NotificationService from "../../services/NotificationService";
import ChatStoreService from "../../services/ChatStoreService";
import { DirectMessage, GroupMessage } from "../../interfaces/Message";
import { NotificationType } from "../../enum/NotificationType";

interface handleNewMessageParam {
    messageSummary: MessageSummary;
}

export const handleNewMessage: handleEvent<handleNewMessageParam> = ({ messageSummary }, cb) => {
    const realMessage = IO.convertMessageSummaryToMessage(messageSummary);
    let notification;
    if (realMessage.type === MessageType.SYSTEM) {
        notification = NotificationService.createUINotification(
            realMessage.content,
            NotificationType.Alert,
            { title: "System" }
        );
    } else {
        notification = NotificationService.createUINotification(
            realMessage.content,
            NotificationType.Alert,
            { title: (realMessage as DirectMessage | GroupMessage).from.info.name }
        );
    }

    if (!document.hasFocus()) {
        NotificationService.systemNotify(notification);
    } else if (!UIStore.store.chatPanel) {
        NotificationService.add(notification);
    }
    ChatStoreService.addMessage(realMessage);
};
