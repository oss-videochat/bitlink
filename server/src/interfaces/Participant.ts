import {Socket} from "socket.io";
import {MediaAction, ParticipantRole, MediaState} from '@bitlink/common';
import {MediasoupPeer} from "./MediasoupPeer";

export interface Participant {
    id: string,
    socket: Socket
    name: string,
    mediasoupPeer: MediasoupPeer,
    mediaState: MediaState,
    isConnected: boolean,
    role: ParticipantRole
}
