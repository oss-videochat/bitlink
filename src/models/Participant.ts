import * as Event from 'events'
import {v4 as uuidv4} from 'uuid';
import * as cryptoRandomString from 'crypto-random-string';
import Message from "./Message";
import  * as mediasoup from "mediasoup";
import MediasoupPeer from "./MediasoupPeer";

interface ParticipantSummary {
    id: string,
    name: string,
    isHost: boolean,
    isAlive: boolean,
}

class Participant extends Event.EventEmitter {
    get isConnected(): boolean {
        return this._isConnected;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
        this.emit("update-name");
    }

    private _name;
    private readonly _id;
    public readonly socket;
    private _isConnected = true;
    public isHost = false;
    public readonly key = cryptoRandomString({length: 12});
    public readonly mediasoupPeer: MediasoupPeer;

    constructor(name: string, socket) {
        super();
        this._id = uuidv4();
        this.socket = socket;
        this.name = name || this.id;
        this.socket.on("disconnect", () => {
            this._isConnected = false;
            this.emit("disconnect");
            setTimeout(() => {
                if(!this.isConnected){
                    this.socket.removeAllListeners();
                }
            }, 0);
        });
        this.socket.on("update-name", (name) => {
            this.name = name;
        });
        this.socket.on("update-settings", (settingsUpdate) => {
            this.updateUserSettings(settingsUpdate);
        });

        this.mediasoupPeer = new MediasoupPeer(this.socket);

        this.mediasoupPeer.on("audio-toggle", (state: boolean) => {
            this.emit("media-state-update", "audio", state ? "resume" : "pause");
        });

        this.mediasoupPeer.on("video-toggle", (state: boolean) => {
            this.emit("media-state-update", "video", state ? "resume" : "pause");
        });
    }

    leave(){
        this._isConnected = false;
        this.mediasoupPeer.destroy();
        this.emit("leave");
    }


    updateUserSettings(object) {

    }

    directMessage(message: Message, eventType: "new" | "edit" | "delete") {
        this.socket.emit(eventType + "-direct-message", message.toSummary());
    }
/*
    kill(){
        this._isConnected = false;
        this.emit("dead");
    }

    revive(){
        this._isConnected = true;
        this.emit("revive");
    }
*/
    toSummary(): ParticipantSummary {
        return {
            id: this.id,
            name: this.name,
            isHost: this.isHost,
            isAlive: this._isConnected,
        }
    }
}

export default Participant;
