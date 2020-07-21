import {handleParticipantEvent} from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";
import {RoomSettings} from "../../interfaces/Room";
import {ParticipantRole} from "@bitlink/common";

interface handleUpdateRoomSettingsParams {
    newSettings: RoomSettings,
}

export const handleUpdateRoomSettings: handleParticipantEvent<handleUpdateRoomSettingsParams> = async ({newSettings, participant, room}, cb) => {
    if (participant.role === ParticipantRole.HOST) {
        cb({
            success: false,
            status: 403,
            error: "You are not a host"
        });
        return;
    }
    try {
        RoomService.updateRoomSettings(room, newSettings)
        cb({
            success: true,
            status: 200,
            error: null
        });
    } catch (e) {
        cb({
            success: false,
            status: 400,
            error: e
        });
    }
};
