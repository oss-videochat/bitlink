import * as socketio from 'socket.io';
import {Participant} from "../interfaces/Participant";
import {v4 as uuidv4} from 'uuid';
import {MediaAction, MediaSource, ParticipantRole, ParticipantSummary} from "@bitlink/common";
import {MediasoupPeer} from "../interfaces/MediasoupPeer";
import debug from "../helpers/debug";

const log = debug("Services:ParticipantService");

class ParticipantService {
    static create(name: string, socket: socketio.Socket, role: ParticipantRole, mediasoupPeer: MediasoupPeer): Participant {
        return {
            id: uuidv4(),
            name: name,
            socket: socket,
            mediasoupPeer: mediasoupPeer,
            isConnected: true,
            mediaState: {
                camera: false,
                microphone: false,
                screen: false
            },
            role
        }
    }

    static getSummary(participant: Participant): ParticipantSummary {
        return {
            id: participant.id,
            name: participant.name,
            role: participant.role,
            isAlive: participant.isConnected,
            mediaState: participant.mediaState
        }
    }

    static changeName(participant: Participant, name: string) {
        participant.name = name;
    }

    static disconnect(participant: Participant) {
        log("Forcing participant to leave", participant.name);
        if (participant.socket.connected) {
            participant.socket.disconnect();
        }
        participant.isConnected = false;
        participant.socket.removeAllListeners();
    }

    static mediaStateUpdate(participant: Participant, source: MediaSource, action: MediaAction) {
        log("Participant %s media state update %s:%S", participant.name, source, action);
        participant.mediaState[source] = action === "resume";
    }
}

export default ParticipantService;
