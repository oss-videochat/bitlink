import Room from './Room';
import Participant from './Participant';
import {SocketWrapper} from "./SocketWrapper";

import * as cryptoRandomString from 'crypto-random-string';
import * as crypto from 'crypto';
import {APIResponseCallback} from "./APIResponse";
import {MediasoupWorkersGroup} from "./MediasoupWorkersGroup";
import * as Events from "events";
import debug from "../helpers/debug";

const log = debug("RoomManger");

interface roomObject {
    [id: string]: Room,
}

class RoomManager extends Events.EventEmitter {
    private rooms: roomObject = {};
    private socketWrapper: SocketWrapper;
    private msWorkerGroup: MediasoupWorkersGroup;

    constructor(socketWrapper: SocketWrapper) {
        super();
        this.socketWrapper = socketWrapper;
        this.socketWrapper.allSockets.on("create-room", this.handleCreateRoom.bind(this));
        this.socketWrapper.allSockets.on("join-room", this.handleJoinRoom.bind(this));
        this.socketWrapper.allSockets.on("get-rtp-capabilities", this.handleGetRTPCapabilities.bind(this));
        MediasoupWorkersGroup.create().then((msWG) => {
            this.msWorkerGroup = msWG;
            this.emit("ready");
            log("Mediasoup workers setup");
        });
    }


    addRoom(room: Room) {
        log("Adding new room with name %s" + room.settings.name);
        room.id = this.getUniqueName();
        room.idHash = crypto.createHash('md5').update(room.id).digest("hex");
        room.on("destroy", () => {
            log("Room destroyed %s" + room.settings.name);
            delete this.rooms[room.id]
        });
        this.rooms[room.id] = (room);
    }

    getUniqueName(): string {
        let unique: string;
        while (!unique || this.rooms.hasOwnProperty(unique)) {
            unique = cryptoRandomString({length: 9, type: 'numeric'});
        }
        return unique;
    }

    async handleCreateRoom(socket, name) {
        log("Creating new room");
        const router = await this.msWorkerGroup.getGoodRouter();
        const room = new Room(name, router);
        this.addRoom(room);
        socket.emit("join-room", room.id);
    }

    handleGetRTPCapabilities(socket, roomId: string, cb: APIResponseCallback){
        const room: Room = this.rooms[roomId];
        if (!room) {
            return  cb({success: false, error: "The room doesn't exist", status: 404});
        }
        return  cb({success: true, error: null, data: room.router.rtpCapabilities ,status: 200});
    }

    handleJoinRoom(socket, roomId: string, name: string, rtpCapabilities: string, cb: APIResponseCallback) {
        log("New participant joining room %s with name ", roomId, name);
        const participant = new Participant(name, socket);
        participant.mediasoupPeer.rtcCapabilities = rtpCapabilities;
        const room = this.rooms[roomId];
        if (!room) {
           return  cb({success: false, error: "The room doesn't exist", status: 404});
        }
        room.addParticipant(participant, cb);

        participant.on("leave", () =>{ // TODO is this necessary? i'm not sure
            log("Participant left %s", participant.name);
            socket.removeAllListeners();
            this.socketWrapper.addSocket(socket);
        });
    }

}

export default RoomManager;
