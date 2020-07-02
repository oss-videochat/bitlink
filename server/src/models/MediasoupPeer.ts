import {types} from "mediasoup";
import {APIResponse} from "./APIResponse";
import * as Events from "events";
import {MediaAction, MediaSource, MediaState} from "@bitlink/common";

type ProducerObj = {
    [key in keyof MediaState]: types.Producer;
};

interface TransportObj {
    sending: types.Transport,
    receiving: types.Transport,
}

export default class MediasoupPeer extends Events.EventEmitter {
    public transports: TransportObj = {
        sending: null,
        receiving: null,
    };
    public producers: ProducerObj = {
        microphone: null,
        camera: null,
        screen: null
    };
    private consumers: Array<types.Consumer> = [];
    public rtcCapabilities;

    constructor(socket) {
        super();
        socket.on("producer-action", (source: MediaSource, action: MediaAction, cb: (response: APIResponse) => void) => {
            const producer: types.Producer = this.producers[source];
            if (!producer) {
                cb({
                    success: false,
                    status: 404,
                    error: "Could not find producer"
                });
                return;
            }
            switch (action) {
                case "resume":
                case "pause":
                    producer[action]().then(() => this.emit("media-state-update", source, action));
                    cb({success: true, status: 200, error: null});
                    break;
                case "close":
                    producer.close();
                    this.emit("media-state-update", source, action)
                    producer[source] = null;
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

    addProducer(producer: types.Producer, mediaSource: MediaSource) {
        this.producers[mediaSource] = producer;
        this.emit("new-producer", mediaSource)
    }

    addConsumer(consumer) {
        this.consumers.push(consumer);
    }

    getProducer(producerId) {
        return Object.values(this.producers).find((producer => producer.id === producerId));
    }

    getConsumersByKind(kind) {
        return this.consumers.filter((consumer => consumer.kind === kind));
    }

    destroy() {
        this.transports.receiving?.close();
        this.transports.sending?.close();
    }
}
