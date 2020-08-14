import { handleParticipantEvent } from "../../interfaces/handleEvent";
import { ParticipantRole } from "@bitlink/common";
import RoomService from "../../services/RoomService";

export const handleEndRoom: handleParticipantEvent = async ({ participant, room }, cb) => {
  if (participant.role !== ParticipantRole.HOST) {
    cb({
      success: false,
      status: 401,
      error: "You must be a host to end the room.",
    });
    return;
  }
  RoomService.destroy(room);
  cb({
    success: true,
    status: 200,
    error: null,
  });
};
