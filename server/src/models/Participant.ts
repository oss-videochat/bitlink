import * as Event from 'events'
import {v4 as uuidv4} from 'uuid';
import * as cryptoRandomString from 'crypto-random-string';
import Message from "./Message";
import MediasoupPeer from "./MediasoupPeer";
import {MediaAction, MediaSource, MediaState} from '@bitlink/common/interfaces/WebRTC';

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
        camera: false,
        screen: false,
        microphone: false
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

        this.mediasoupPeer.on("media-state-update", (source: MediaSource, action: MediaAction) => {
            this.emit("media-state-update", source, action);
            this.mediaState[source] = action === "resume";
        });

        this.mediasoupPeer.on("new-producer", (source: MediaSource) => {
            this.mediaState[source] = true;
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
