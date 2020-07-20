import {handleParticipantEvent} from "../../interfaces/handleEvent";
import {MediaType, MediaSource} from "@bitlink/common";
import {types} from "mediasoup";
import MediasoupPeerService from "../../services/MediasoupPeerService";
import WebRTCRoomService from "../../services/WebRTCRoomService";

interface handleCreateProducerParam {
    transportId: string,
    kind: MediaType,
    source: MediaSource,
    rtpParameters: types.RtpParameters
}

const handleCreateProducer: handleParticipantEvent<handleCreateProducerParam> = async ({transportId, source, kind, rtpParameters,participant, room}, cb) => {
    const transport = MediasoupPeerService.getTransport(participant.mediasoupPeer,transportId);
    if (!transport) {
        cb({
            success: false,
            error: "Could not find a transport with that id",
            status: 404
        });
        return;
    }
    if (!["camera", "microphone", "screen"].includes(source)) {
        cb({
            success: false,
            error: "Some error occurred. Probably your crappy input.",
            status: 400
        });
        return;
    }
    if (!["video", "audio"].includes(kind)) {
        cb({
            success: false,
            error: "Some error occurred. Probably your crappy input.",
            status: 400
        });
        return;
    }
    WebRTCRoomService.createProducer(room, participant, transport, kind, rtpParameters, source)
        .then((producer) => {
            cb({
                success: true,
                error: null,
                data: {
                    id: producer.id
                },
                status: 200,
            });
        })
        .catch((err) => {
            cb({
                success: false,
                error: "Some error occurred. Probably your crappy input.",
                status: 400
            });
        })
};
export default handleCreateProducer;
