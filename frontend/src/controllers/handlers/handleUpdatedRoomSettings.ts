import {handleEvent} from "../../interfaces/handleEvent";
import RoomStore from "../../stores/RoomStore";

export interface RoomSettings {
    name: string
    waitingRoom: boolean,
}

interface handleUpdatedRoomSettingsParam {
    newSettings: RoomSettings
}

export const handleUpdatedRoomSettings: handleEvent<handleUpdatedRoomSettingsParam> = ({newSettings}, cb) => {
    if (RoomStore.info!.name !== newSettings.name) {
        RoomStore.info!.name = newSettings.name;
    }
};
