import {handleEvent} from "../../interfaces/handleEvent";
import RoomStore from "../../stores/RoomStore";
import {RoomSettings} from "@bitlink/common";


interface handleUpdatedRoomSettingsParam {
    newSettings: RoomSettings
}

export const handleUpdatedRoomSettings: handleEvent<handleUpdatedRoomSettingsParam> = ({newSettings}, cb) => {
    if (RoomStore.info!.name !== newSettings.name) {
        RoomStore.info!.name = newSettings.name;
    }
};
