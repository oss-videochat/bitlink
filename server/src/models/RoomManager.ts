import Room from './Room';
import Participant from './Participant';
import * as http from 'http';
import * as cryptoRandomString from 'crypto-random-string';
import * as crypto from 'crypto';
import {APIResponseCallback} from "./APIResponse";
import {MediasoupWorkersGroup} from "./MediasoupWorkersGroup";
import * as Events from "events";
import debug from "../helpers/debug";
import * as socketio from 'socket.io';

const log = debug("RoomManger");

interface RoomObject {
    [id: string]: Room,
}

class RoomManager extends Events.EventEmitter {
    private rooms: RoomObject = {};
    private io: socketio.Server;
    private clientSockets: socketio.Socket[] = [];
    private msWorkerGroup: MediasoupWorkersGroup;

    private constructor(server: http.Server, msWorkerGroup) {
        super();
        this.io = socketio(server);
        this.io.on("connection", this.addSocket.bind(this));
        this.msWorkerGroup = msWorkerGroup;
    }

    static async create(server: http.Server){
        const msWorkerGroup = await MediasoupWorkersGroup.create();
        log("Mediasoup workers setup");
        return new RoomManager(server, msWorkerGroup);
    }

    private addSocket(socket){
        this.clientSockets.push(socket);
        socket.on("get-rtp-capabilities", (roomId: string, cb: APIResponseCallback) => this.handleGetRTPCapabilities(socket, roomId, cb));
        socket.on("create-room", (name: string) => this.handleCreateRoom(socket, name));
        socket.on("join-room", (roomId: string, name: string, rtpCapabilities: string, cb: APIResponseCallback) => this.handleJoinRoom(socket, roomId, name, rtpCapabilities, cb) );
        socket.on("disconnect", () => this.removeSocket(socket));
    }

    private removeSocket(socket){
        this.clientSockets.splice(this.clientSockets.indexOf(socket), 1);
    }

    private addRoom(room: Room) {
        log("Adding new room with name %s" + room.settings.name);
        room.id = this.getUniqueName();
        room.idHash = crypto.createHash('md5').update(room.id).digest("hex");
        room.on("destroy", () => {
            log("Room destroyed %s" + room.settings.name);
            delete this.rooms[room.id]
        });
        this.rooms[room.id] = (room);
    }

    private getUniqueName(): string {
        let unique: string;
        while (!unique || this.rooms.hasOwnProperty(unique)) {
            unique = cryptoRandomString({length: 9, type: 'numeric'});
        }
        return unique;
    }

    private async handleCreateRoom(socket, name) {
        log("Creating new room");
        const router = await this.msWorkerGroup.getGoodRouter();
        const room = new Room(name, router);
        this.addRoom(room);
        socket.emit("join-room", room.id);
    }

    private handleJoinRoom(socket, roomId: string, name: string, rtpCapabilities: string, cb: APIResponseCallback) {
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
            this.removeSocket(socket);
            this.addSocket(socket);
        });
}

export default RoomManager;
