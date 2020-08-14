import { handleEvent } from "../../interfaces/handleEvent";
import { MediaSource, MediaType } from "@bitlink/common";
import MyInfo from "../../stores/MyInfoStore";
import debug from "../../util/debug";
import ParticipantService from "../../services/ParticipantService";

const log = debug("Handlers:NewConsumer");

interface handleNewConsumerParam {
  source: MediaSource;
  kind: MediaType;
  participantId: string;
  data: any;
}

export const handleNewConsumer: handleEvent<handleNewConsumerParam> = async (
  { source, kind, participantId, data, io },
  cb
) => {
  const participant = ParticipantService.getById(participantId);
  if (!participant) {
    throw "Could not find participant";
  }
  log("New Consumer for %s: %s", participant.info.name, source);
  participant.consumers[source] = await MyInfo.transports.receiving!.consume({
    id: data.consumerId,
    producerId: data.producerId,
    kind: kind,
    rtpParameters: data.rtpParameters,
  });

  participant.consumers[source]!.on("transportclose", () => {
    participant.consumers[source] = null;
  });

  cb(true);
  participant.consumers[source]?.resume();
};
