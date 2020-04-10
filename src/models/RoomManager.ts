import Room from './Room';
import Participant from './Participant';
import {Router, Request, Response, NextFunction} from "express";
import {SocketWrapper} from "./SocketWrapper";

import * as cryptoRandomString from 'crypto-random-string';
import * as crypto from 'crypto';
import {APIResponseCallback} from "./APIResponse";

interface roomObject {
    [id: string]: Room,
}

class RoomManager {
    private rooms: roomObject = {};
    private socketWrapper: SocketWrapper;
    public readonly router = Router();

    constructor(socketWrapper: SocketWrapper) {
        this.socketWrapper = socketWrapper;
        this.socketWrapper.allSockets.on("create-room", this.handleCreateRoom.bind(this));
        this.socketWrapper.allSockets.on("join-room", this.handleJoinRoom.bind(this));
    }

    getRoom(name: string) {
        return this.rooms[name];
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

    handleCreateRoom(socket, name) {
        const room = new Room(name);
        this.addRoom(room);
        socket.emit("join-room", room.id);
    }

    handleJoinRoom(socket, roomId: string, name: string, cb: APIResponseCallback) {
        const participant = new Participant(name, socket);
        const room = this.rooms[roomId];
        if (!room) {
           return  cb({success: false, error: "The room doesn't exist", status: 404});
        }
        room.addParticipant(participant, cb);
    }

}

export default RoomManager;
