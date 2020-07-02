import * as Event from 'events'
import {v4 as uuidv4} from 'uuid';
import * as cryptoRandomString from 'crypto-random-string';
import Message from "./Message";
import MediasoupPeer from "./MediasoupPeer";
import {MediaAction, MediaSource, MediaState} from '@bitlink/common/interfaces/WebRTC';
import {ParticipantSummary} from "@bitlink/common/interfaces/Summaries";
import {ParticipantRole} from "@bitlink/common/enum/ParticipantRole";

class Participant extends Event.EventEmitter {
    public readonly id;
    public readonly socket;
    public readonly key = cryptoRandomString({length: 12});
    public readonly mediasoupPeer: MediasoupPeer;
    private readonly mediaState: MediaState = {
        camera: false,
        screen: false,
        microphone: false
    };

    public name;
    public isConnected = true;
    public role = ParticipantRole.MEMBER;

    constructor(name: string, socket) {
        super();
        this.id = uuidv4();
        this.socket = socket;
        this.name = name || this.id;
        this.mediasoupPeer = new MediasoupPeer(this.socket);
        this.setupListeners();
    }

    get isHost(){
        return this.role === ParticipantRole.HOST;
    }

    setupListeners(){
        this.socket.on("disconnect", () => {
            this.isConnected = false;
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

        this.mediasoupPeer.on("media-state-update", (source: MediaSource, action: MediaAction) => {
            this.emit("media-state-update", source, action);
            this.mediaState[source] = action === "resume";
        });

        this.mediasoupPeer.on("new-producer", (source: MediaSource) => {
            this.mediaState[source] = true;
        });
    }

    leave() {
        this.isConnected = false;
        this.mediasoupPeer.destroy();
        this.emit("leave");
    }

    directMessage(message: Message, eventType: "new" | "edit" | "delete") {
        this.socket.emit(eventType + "-direct-message", message.toSummary());
    }

    toSummary(): ParticipantSummary {
        return {
            id: this.id,
            name: this.name,
            role: this.role,
            isAlive: this.isConnected,
            mediaState: this.mediaState
        }
    }
}

export default Participant;
