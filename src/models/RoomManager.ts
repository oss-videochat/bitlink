import Room from './Room';
import Participant from './Participant';
import {Router, Request, Response, NextFunction} from "express";
import {SocketWrapper} from "./SocketWrapper";

import * as cryptoRandomString from 'crypto-random-string';
import * as crypto from 'crypto';

interface roomObject {
    [id: string]: Room,
}

class RoomManager {
    private activeMembers = 0;
    private rooms: roomObject = {};
    private socketWrapper: SocketWrapper;
    public readonly router = Router();

    constructor(socketWrapper: SocketWrapper) {
        this.socketWrapper = socketWrapper;
        this.socketWrapper.allSockets.on("create-room", this.handleCreateRoom.bind(this));
        this.socketWrapper.allSockets.on("join-room", this.handleJoinRoom.bind(this));
        this.setUpRouter();
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

    handleCreateRoom(socket) {
        const room = new Room();
        this.addRoom(room);
        socket.emit("join-room", room.id);
    }

    handleJoinRoom(socket, roomId: string, name: string) {
        const participant = new Participant(name, socket);
        const room = this.rooms[roomId];
        if (!room) {
            return socket.emit("error", "join", "The room doesn't exist", 'J404');
        }
        room.addParticipant(participant);
    }

    setUpRouter(){
        const router = this.router;

        const roomHashAndJSONValidator = (req: Request, res: Response, next: NextFunction) => {
            if(!req.is("application/json")){
                return res.status(400).json({success: false, error: "Request must be 'Content-Type: application/json'"})
            }
            const room: Room | undefined = Object.values(this.rooms).find((room: Room) => room.idHash === req.params.roomIdHash);
            if(!room){
                return res.status(404).json({success: false, error: "Could not find room"})
            }
            req.room = room;
            return next();
        };

        router.post("/:roomIdHash/send", roomHashAndJSONValidator,  (req, res, next) => {
            const resp = req.room.sendMessage(req.body.from, req.body.to, req.body.content);
            res.status(resp.status);
            delete resp.status;
            res.json(resp);
        });


        router.post("/:roomIdHash/edit", roomHashAndJSONValidator,  (req, res, next) => {
            const resp = req.room.editMessage(req.body.from, req.body.message, req.body.content);
            res.status(resp.status);
            delete resp.status;
            res.json(resp);
        });


        router.post("/:roomIdHash/delete", roomHashAndJSONValidator,  (req, res, next) => {
            const resp = req.room.deleteMessage(req.body.from, req.body.message);
            res.status(resp.status);
            delete resp.status;
            res.json(resp);
        });
    }

}

export default RoomManager;
