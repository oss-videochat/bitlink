import {handleEvent} from "../../interfaces/handleEvent";
import {types} from "mediasoup-client";
import {RoomSummary} from "@bitlink/common";
import NotificationStore, {NotificationType, UINotification} from "../../stores/NotificationStore";
import UIStore from "../../stores/UIStore";
import IO from "../IO";

interface handleWaitingRoomAcceptParam  {
    summary: RoomSummary,
    rtcCapabilities: types.RtpCapabilities
}

export const handleWaitingRoomAccept: handleEvent<handleWaitingRoomAcceptParam> = async (data, cb) => {
    NotificationStore.add(new UINotification("You were accepted into the room!", NotificationType.Success), true);
    UIStore.store.modalStore.waitingRoom = false;
    IO.processRoomSummary(data);
    IO.createTransports()
        .then(() => data.io.emit("transports-ready"));
};
