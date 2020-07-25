import * as socketio from 'socket.io';
import {MediasoupPeer} from "../interfaces/MediasoupPeer";
import {types} from "mediasoup";
import {MediaAction, MediaSource, TransportJob} from "@bitlink/common";
import {Participant} from "../interfaces/Participant";
import debug from "../helpers/debug";

const log = debug("Services:MediasoupPeerService");

class MediasoupPeerService {
    static create(socket: socketio.Socket, rtcCapabilities: types.RtpCapabilities): MediasoupPeer {
        return {
            consumers: [],
            producers: {
                camera: undefined,
                microphone: undefined,
                screen: undefined
            },
            rtcCapabilities,
            transports: {receiving: undefined, sending: undefined}
        }
    }

    static destroy(mediasoupPeer: MediasoupPeer) {
        mediasoupPeer.transports.receiving?.close();
        mediasoupPeer.transports.sending?.close();
    }

    static producerAction(mediasoupPeer: MediasoupPeer, source: MediaSource, action: MediaAction) {
        const producer = mediasoupPeer.producers[source];
        if (!producer) {
            return {
                success: false,
                status: 404,
                error: "Could not find producer"
            };
        }
        switch (action) {
            case "resume":
            case "pause":
                producer[action]();
                return {success: true, status: 200, error: null};
            case "close":
                producer.close();
                mediasoupPeer.producers[source] = undefined;
                return {success: true, status: 200, error: null};
            default:
                return {
                    success: false,
                    status: 400,
                    error: "Bad action"
                };
        }
    }

    static addTransport(mediasoupPeer: MediasoupPeer, transport: types.WebRtcTransport | types.PlainTransport, job: TransportJob) {
        mediasoupPeer.transports[job] = transport;
    }

    static connectTransport(transport: types.Transport, dtlsParameters: types.DtlsParameters, participant: Participant) {
        log("Participant connecting to a transport %s:%s", participant.name, transport.id);
        return transport.connect({dtlsParameters}).then(() => transport.appData.connected = true)
    }

    static getTransport(mediasoupPeer: MediasoupPeer, transportId: string) {
        return Object.values(mediasoupPeer.transports).find((transport => transport?.id === transportId));
    }

    static addConsumer(mediasoupPeer: MediasoupPeer, consumer: types.Consumer) {
        mediasoupPeer.consumers.push(consumer);
    }

    static addProducer(mediasoupPeer: MediasoupPeer, producer: types.Producer, mediaSource: MediaSource) {
        mediasoupPeer.producers[mediaSource] = producer;
    }
}

export default MediasoupPeerService;
