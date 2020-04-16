import Room from './Room';
import Participant from './Participant';
import {SocketWrapper} from "./SocketWrapper";
import * as mediasoup from 'mediasoup';

import * as cryptoRandomString from 'crypto-random-string';
import * as crypto from 'crypto';
import {APIResponseCallback} from "./APIResponse";
import {config} from "../../config";
import {MediasoupWorkersGroup} from "./MediasoupWorkersGroup";
import * as Events from "events";


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
            console.log("Ready!");
        });
    }


    addRoom(room: Room) {
        room.id = this.getUniqueName();
        room.idHash = crypto.createHash('md5').update(room.id).digest("hex");
        room.on("destroy", () => delete this.rooms[room.id]);
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
        const participant = new Participant(name, socket);
        participant.mediasoupPeer.rtcCapabilities = rtpCapabilities;
        const room = this.rooms[roomId];
        if (!room) {
           return  cb({success: false, error: "The room doesn't exist", status: 404});
        }
        room.addParticipant(participant, cb);
    }

}

export default RoomManager;
