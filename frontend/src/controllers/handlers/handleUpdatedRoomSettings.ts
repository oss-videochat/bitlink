import {handleEvent} from "../../interfaces/handleEvent";
import RoomStore from "../../stores/RoomStore";

export interface RoomSettings {
    name: string
    waitingRoom: boolean,
}

interface handleUpdatedRoomSettingsParam {
    newSettings: RoomSettings
}

export const handleUpdatedRoomSettings: handleEvent<handleUpdatedRoomSettingsParam> = async ({newSettings}, cb) => {
    if (RoomStore.room!.name !== newSettings.name) {
        RoomStore.room!.name = newSettings.name;
    }
};
