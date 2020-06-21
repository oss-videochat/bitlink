import * as Event from 'events'
import {v4 as uuidv4} from 'uuid';
import * as cryptoRandomString from 'crypto-random-string';
import Message from "./Message";
import MediasoupPeer from "./MediasoupPeer";

interface MediaState {
    cameraEnabled: boolean,
    microphoneEnabled: boolean,
    screenShareEnabled: boolean
}

interface ParticipantSummary {
    id: string,
    name: string,
    isHost: boolean,
    isAlive: boolean,
    mediaState: MediaState
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
    private readonly mediaState: MediaState = {
        cameraEnabled: false,
        microphoneEnabled: false,
        screenShareEnabled: false
    };

    constructor(name: string, socket) {
        super();
        this._id = uuidv4();
        this.socket = socket;
        this.name = name || this.id;
        this.socket.on("disconnect", () => {
            this._isConnected = false;
            this.emit("disconnect");
            setTimeout(() => {
                if (!this.isConnected) {
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
            this.mediaState.microphoneEnabled = state;
        });

        this.mediasoupPeer.on("video-toggle", (state: boolean) => {
            this.emit("media-state-update", "video", state ? "resume" : "pause");
            this.mediaState.cameraEnabled = state;
        });

        this.mediasoupPeer.on("screen-toggle", (state: boolean) => {
            this.emit("media-state-update", "screen", state ? "resume" : "pause");
            this.mediaState.screenShareEnabled = state;
        });

        this.mediasoupPeer.on("new-producer", (kind: "video" | "audio" | "screen") => {
            if (kind === "video") {
                this.mediaState.cameraEnabled = true;
            } else if(kind === "audio") {
                this.mediaState.microphoneEnabled = true;
            } else {
                this.mediaState.screenShareEnabled = true;
            }
        });
    }

    leave() {
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
            mediaState: this.mediaState
        }
    }
}

export default Participant;
