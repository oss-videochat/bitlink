import * as Event from 'events'
import {v4 as uuidv4} from 'uuid';

interface UserSettings {
    cameraEnabled?: boolean,
    microphoneEnabled?: boolean,
}

class Participant extends Event.EventEmitter {
    get settings(): UserSettings {
        return this._settings;
    }

    get id() {
        return this._id;
    }

    private _name;
    private _id;
    public readonly socket;
    public isHost = false;

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

}

export default Participant;
