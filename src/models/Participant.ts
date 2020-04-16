import * as Event from 'events'
import {v4 as uuidv4} from 'uuid';
import * as cryptoRandomString from 'crypto-random-string';
import Message from "./Message";
import  * as mediasoup from "mediasoup";
import MediasoupPeer from "./MediasoupPeer";

interface UserSettings {
    cameraEnabled?: boolean,
    microphoneEnabled?: boolean,
}

interface ParticipantSummary {
    id: string,
    name: string,
    settings: UserSettings,
    isHost: boolean,
    isAlive: boolean,
}

class Participant extends Event.EventEmitter {
    get isAlive(): boolean {
        return this._isAlive;
    }

    get settings(): UserSettings {
        return this._settings;
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
    private _isAlive = true;
    public isHost = false;
    public readonly key = cryptoRandomString({length: 12});
    public readonly mediasoupPeer: MediasoupPeer;

    private _settings: UserSettings = {
        cameraEnabled: false,
        microphoneEnabled: false
    };

    constructor(name: string, socket) {
        super();
        this._id = uuidv4();
        this.socket = socket;
        this.name = name || this.id;
        this.socket.on("disconnect", () => {
            this.emit("leave");
        });
        this.socket.on("update-name", (name) => {
            this.name = name;
        });
        this.socket.on("update-settings", (name) => {
            this.updateUserSettings(name);
        });

        this.mediasoupPeer = new MediasoupPeer(this.socket)
    }


    updateUserSettings(object: UserSettings) {
        Object.assign(this._settings, object);
        this.emit("update-settings");
    }

    directMessage(message: Message, eventType: "new" | "edit" | "delete") {
        this.socket.emit(eventType + "-direct-message", message.toSummary());
    }

    kill(){
        this._isAlive = false;
        this.emit("dead");
    }

    revive(){
        this._isAlive = true;
        this.emit("revive");
    }

    toSummary(): ParticipantSummary {
        return {
            id: this.id,
            name: this.name,
            settings: this.settings,
            isHost: this.isHost,
            isAlive: this._isAlive,
        }
    }
}

export default Participant;
