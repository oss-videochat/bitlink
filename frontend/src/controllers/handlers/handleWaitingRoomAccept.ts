import { handleEvent } from "../../interfaces/handleEvent";
import { types } from "mediasoup-client";
import { RoomSummary } from "@bitlink/common";
import UIStore from "../../stores/UIStore";
import IO from "../IO";
import NotificationService from "../../services/NotificationService";
import { NotificationType } from "../../enum/NotificationType";

interface handleWaitingRoomAcceptParam {
    summary: RoomSummary;
    rtcCapabilities: types.RtpCapabilities;
}

export const handleWaitingRoomAccept: handleEvent<handleWaitingRoomAcceptParam> = (data, cb) => {
    NotificationService.add(
        NotificationService.createUINotification(
            "You were accepted into the room!",
            NotificationType.Success
        ),
        true
    );
    UIStore.store.modalStore.waitingRoom = false;
    IO.processRoomSummary(data);
    IO.createTransports().then(() => data.io.emit("transports-ready"));
};
