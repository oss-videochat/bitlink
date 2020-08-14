import { handleParticipantEvent } from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";
import { MediaAction, MediaSource } from "@bitlink/common";
import MediasoupPeerService from "../../services/MediasoupPeerService";
import ParticipantService from "../../services/ParticipantService";

interface handleProducerActionParams {
  source: MediaSource;
  action: MediaAction;
}

export const handleProducerAction: handleParticipantEvent<handleProducerActionParams> = async (
  { source, action, participant, room },
  cb
) => {
  const response = MediasoupPeerService.producerAction(participant.mediasoupPeer, source, action);
  if (!response.success) {
    return cb(response);
  }
  ParticipantService.mediaStateUpdate(participant, source, action);
  RoomService.mediaStateUpdate(room, participant, source, action);
};
