import * as Event from 'events'
import { v4 as uuidv4 } from 'uuid';

interface UserSettings {
    cameraEnabled?: boolean,
    microphoneEnabled?: boolean,
}

class Participant extends Event.EventEmitter {
    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
        this.emit("update-name");
    }
    private _name;
    private id;
    private settings: UserSettings = {
        cameraEnabled: false,
        microphoneEnabled: false
    };

    constructor(name: string) {
        super();
        this.id = uuidv4();
    }

    updateUserSettings(object: UserSettings){
        Object.assign(this.settings, object);
        this.emit("update-settings");
    }

}

export default Participant;
