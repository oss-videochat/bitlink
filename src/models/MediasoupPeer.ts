import {types} from "mediasoup";
import {APIResponse} from "./APIResponse";

interface ProducerObj {
    video: types.Producer,
    audio: types.Producer,
}

interface TransportObj {
    sending: types.Transport,
    receiving: types.Transport,
}

export default class MediasoupPeer {
    public transports: TransportObj = {
        sending: null,
        receiving: null,
    };
    public producers: ProducerObj = {
        video: null,
        audio: null
    };
    private consumers: Array<types.Consumer> = [];
    public rtcCapabilities;

    constructor(socket) {
        socket.on("producer-action", (type, action, cb: (response: APIResponse) => void) => {
            const producer: types.Producer = this.producers[type];
            if (!producer) {
                cb({
                    success: false,
                    status: 404,
                    error: "Could not find producer"
                });
                return;
            }
            switch (action) {
                case "pause":
                    producer.pause();
                    cb({success: true, status: 200, error: null});
                    break;
                case "resume":
                    producer.resume();
                    cb({success: true, status: 200, error: null});
                    break;
                case "close":
                    producer.close();
                    producer[type] = null;
                    cb({success: true, status: 200, error: null});
                    break;
                default:
                    cb({
                        success: false,
                        status: 400,
                        error: "Bad action"
                    });
            }
        });
    }

    addTransport(transport: types.Transport, type: "sending" | "receiving") {
        this.transports[type] = transport;
    }

    getTransport(transportId) {
        return Object.values(this.transports).find((transport => transport.id === transportId));
    }

    addProducer(producer, kind: "video" | "audio") {
        this.producers[kind] = producer;
    }

    addConsumer(consumer) {
        this.consumers.push(consumer);
    }

    getProducer(producerId) {
        return Object.values(this.producers).find((producer => producer.id === producerId));
    }

    getProducersByKind(kind: "video" | "audio") {
        return this.producers[kind];
    }

    getConsumersByKind(kind) {
        return this.consumers.filter((consumer => consumer.kind === kind));
    }

}
