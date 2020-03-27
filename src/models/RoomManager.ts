import Room from './Room';
import Participant from './Participant';

import {SocketWrapper} from "./SocketWrapper";

const cryptoRandomString = require('crypto-random-string');

interface roomObject {
   [id: string]: Room,
}

class RoomManager {
    private activeMembers = 0;
    private rooms = {};
    private socketWrapper: SocketWrapper;

    constructor(socketWrapper: SocketWrapper) {
        this.socketWrapper = socketWrapper;
        this.socketWrapper.allSockets.on("create-room", this.handleCreateRoom.bind(this));
        this.socketWrapper.allSockets.on("join-room", this.handleJoinRoom.bind(this))

    }

    getRoom(name: string){
        return this.rooms[name];
    }

    addRoom(room: Room){
        room.id = this.getUniqueName();
        room.on("closed", () => delete this.rooms[room.id]);
        this.rooms[room.id] = (room);
    }

    getUniqueName(): string {
        let unique: string;
        while (!unique || this.rooms.hasOwnProperty(unique)){
            unique = cryptoRandomString({length: 9, type: 'numeric'});
        }
        return unique;
    }

    handleCreateRoom(socket){
        const room = new Room();
        this.addRoom(room);
        socket.emit("join-room", room.id);
    }

    handleJoinRoom(socket, roomId: string, name: string){
        const participant = new Participant(name, socket);
        const room = this.rooms[roomId];
        if(!room){
            return socket.emit("error", "join", "The room doesn't exist", 'J404');
        }
        room.addParticipant(participant);
    }

}

export default RoomManager;
