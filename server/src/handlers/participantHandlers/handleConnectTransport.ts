import {handleParticipantEvent} from "../../interfaces/handleEvent";
import {types} from "mediasoup";
import MediasoupPeerService from "../../services/MediasoupPeerService";

interface handleConnectTransportParam {
    transportId: string,
    dtlsParameters: types.DtlsParameters
}

const handleConnectTransport: handleParticipantEvent<handleConnectTransportParam> = async ({transportId, dtlsParameters, room, participant}, cb) => {
    const transport = MediasoupPeerService.getTransport(participant.mediasoupPeer, transportId);
    if (!transport) {
        cb({
            success: false,
            error: "Could not find a transport with that id",
            status: 404
        });
        return;
    }
    if (transport.appData.connected) {
        cb({
            success: false,
            error: "Transport already connected",
            status: 409,
        });
        return;
    }
    MediasoupPeerService.connectTransport(transport, dtlsParameters, participant)
        .then(() => {
            cb({
                success: true,
                error: null,
                status: 200,
            });
        })
        .catch((err: any) => {
            console.error(err.toString());
            cb({
                success: false,
                error: "Unknown server error occurred. Check server log.",
                status: 500,
            });
        });
};
export default handleConnectTransport;
