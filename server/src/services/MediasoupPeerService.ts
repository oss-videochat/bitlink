import * as socketio from 'socket.io';
import {MediasoupPeer} from "../interfaces/MediasoupPeer";
import {types} from "mediasoup";

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
}
export default MediasoupPeerService;
