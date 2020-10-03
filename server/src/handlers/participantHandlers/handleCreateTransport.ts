import { handleParticipantEvent } from "../../interfaces/handleEvent";
import { TransportJob, TransportType } from "@bitlink/common";
import WebRTCRoomService from "../../services/WebRTCRoomService";

interface handleCreateTransportParam {
    type: TransportType;
    kind: TransportJob;
}

export const handleCreateTransport: handleParticipantEvent<handleCreateTransportParam> = async (
    { room, participant, type, kind },
    cb
) => {
    if (!["webrtc" /*"plain"*/].includes(type)) {
        cb({
            success: false,
            error: "Unknown type",
            status: 400,
        });
    }
    const transport = await WebRTCRoomService.createTransport(room, participant, type, kind);
    cb({
        success: true,
        error: null,
        status: 200,
        data: {
            transportInfo: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters,
            },
            transportType: type,
        },
    });
};
