import { handleParticipantEvent } from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";
import { ParticipantRole, RoomSettings } from "@bitlink/common";

interface handleUpdateRoomSettingsParams {
  newSettings: RoomSettings;
}

export const handleUpdateRoomSettings: handleParticipantEvent<handleUpdateRoomSettingsParams> = (
  { newSettings, participant, room },
  cb
) => {
  if (participant.role !== ParticipantRole.HOST) {
    cb({
      success: false,
      status: 403,
      error: "You are not a host",
    });
    return;
  }
  try {
    RoomService.updateRoomSettings(room, newSettings);
    cb({
      success: true,
      status: 200,
      error: null,
    });
  } catch (e) {
    cb({
      success: false,
      status: 400,
      error: e,
    });
  }
};
