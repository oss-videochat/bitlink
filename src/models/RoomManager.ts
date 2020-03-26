import Room from './Room';

const cryptoRandomString = require('crypto-random-string');

class RoomManager {
    private activeMembers = 0;
    private rooms = new Set();

    constructor() {

    }

    getRoom(name: string){
        return this.rooms[name];
    }

    addRoom(room: Room){
        room.name = this.getUniqueName();
        room.on("closed", () => delete this.rooms[room.name]);
        this.rooms[room.name] = room;
    }

    getUniqueName(): string {
        let unique: string;
        while (!unique || this.rooms.hasOwnProperty(unique)){
            unique = cryptoRandomString({length: 9, type: 'numeric'});
        }
        return unique;
    }

}

export default RoomManager;
