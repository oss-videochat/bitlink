import * as Event from 'events'
import {v4 as uuidv4} from 'uuid';
import * as cryptoRandomString from 'crypto-random-string';
import Message from "./Message";

interface UserSettings {
    cameraEnabled?: boolean,
    microphoneEnabled?: boolean,
}

interface ParticipantSummary {
    id: string,
    settings: UserSettings,
    isHost: boolean
}

class Participant extends Event.EventEmitter {
    get settings(): UserSettings {
        return this._settings;
    }

    get id() {
        return this._id;
    }

    private _name;
    private readonly _id;
    public readonly socket;
    public isHost = false;
    public readonly key = cryptoRandomString({length: 12});

    private _settings: UserSettings = {
        cameraEnabled: false,
        microphoneEnabled: false
    };

    constructor(name: string, socket) {
        super();
        this._id = uuidv4();
        this.socket = socket;
        this.socket.on("disconnect", () => {
            this.emit("leave");
        });
        this.socket.on("update-name", (name) => {
            this.name = name;
        });
        this.socket.on("update-settings", (name) => {
            this.updateUserSettings(name);
        });
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
        this.emit("update-name");
    }

    updateUserSettings(object: UserSettings) {
        Object.assign(this._settings, object);
        this.emit("update-settings");
    }

    directMessage(message: Message, eventType: "new" | "edit" | "delete") {
        this.socket.emit(eventType + "-direct-message", JSON.stringify(message.toSummary()));
    }

    toSummary(): ParticipantSummary {
        return {
            id: this.id,
            settings: this.settings,
            isHost: this.isHost
        }
    }
}

export default Participant;
