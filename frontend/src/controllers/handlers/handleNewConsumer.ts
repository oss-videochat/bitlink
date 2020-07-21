import {handleEvent} from "../../interfaces/handleEvent";
import {MediaType, MediaSource} from "@bitlink/common";
import ParticipantsStore from "../../stores/ParticipantsStore";
import MyInfo from "../../stores/MyInfo";
import debug from "../../util/debug";

const log = debug("Handlers:NewConsumer");

interface handleNewConsumerParam {
    source: MediaSource,
    kind: MediaType,
    participantId: string,
    data: any
}

export const handleNewConsumer: handleEvent<handleNewConsumerParam> = async ({source, kind, participantId, data, io}, cb) => {
    const participant = ParticipantsStore.getById(participantId);
    if (!participant) {
        throw 'Could not find participant';
    }
    log("New Consumer for %s: %s", participant.name, source);
    participant.mediasoup!.consumer[source] = await MyInfo.mediasoup.transports.receiving!.consume({
        id: data.consumerId,
        producerId: data.producerId,
        kind: kind,
        rtpParameters: data.rtpParameters
    });

    participant.mediasoup!.consumer[source]!.on("transportclose", () => {
        participant.mediasoup!.consumer[source] = null;
    });

    cb(true);
    participant.mediasoup!.consumer[source]?.resume();
};
