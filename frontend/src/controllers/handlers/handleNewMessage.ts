import {handleEvent} from "../../interfaces/handleEvent";
import {MessageSummary} from "@bitlink/common";
import NotificationStore, {NotificationType, UINotification} from "../../stores/NotificationStore";
import UIStore from "../../stores/UIStore";
import ChatStore from "../../stores/ChatStore";
import IO from "../IO";

interface handleNewMessageParam {
    messageSummary: MessageSummary
}

export const handleNewMessage: handleEvent<handleNewMessageParam> = async ({messageSummary}, cb) => {
    const realMessage = IO.convertMessageSummaryToMessage(messageSummary);
    const notification = new UINotification(realMessage.content, NotificationType.Alert, {title: realMessage.from.name});
    if (!document.hasFocus()) {
        NotificationStore.systemNotify(notification);
    } else if (!UIStore.store.chatPanel) {
        NotificationStore.add(notification);
    }
    ChatStore.addMessage(realMessage);
};
