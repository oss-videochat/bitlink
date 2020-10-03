import { handleParticipantEvent } from "../../interfaces/handleEvent";
import WebRTCRoomService from "../../services/WebRTCRoomService";

export const handleTransportsReady: handleParticipantEvent = async ({ participant, room }, cb) => {
    WebRTCRoomService.notifyParticipantOfProducers(room, participant);
};
