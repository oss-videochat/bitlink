import * as socketio from 'socket.io';
import {Participant} from "../interfaces/Participant";
import {v4 as uuidv4} from 'uuid';
import {ParticipantRole} from "@bitlink/common";
import MediasoupPeerService from "./MediasoupPeerService";
import {MediasoupPeer} from "../interfaces/MediasoupPeer";
import {ParticipantSummary} from "@bitlink/common";
import RoomService from "./RoomService";
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

    static changeName(participant: Participant, name: string){
        participant.name = name;
        //TODO alert poeple
    }

    static disconnect(participant: Participant) {
        log("Forcing participant to leave", participant.name);
       if(participant.socket.connected){
           participant.socket.disconnect();
       }
       participant.isConnected = false;
       participant.socket.removeAllListeners();
    }
}
export default ParticipantService;
