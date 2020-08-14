import { handleParticipantEvent } from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";

export const handleLeaveParticipant: handleParticipantEvent = async ({ participant, room }, cb) => {
  RoomService.participantLeft(room, participant);
};
