import {observable} from "mobx"
import {Message} from "./MessagesStore";

interface UserSettings {
    cameraEnabled: boolean,
    microphoneEnabled: boolean,
}

export interface ParticipantInformation {
    id: string,
    name: string,
    settings: UserSettings,
    isHost: boolean,
    isMe: boolean,
    isAlive: boolean,
}

class ParticipantsStore {

    public system: ParticipantInformation = {
        id: "system",
        isAlive: true,
        isHost: false, isMe: false, name: "System",
        settings: {
            cameraEnabled: false,
            microphoneEnabled: false
        }
    };

    public everyone: ParticipantInformation = {
        id: "everyone",
        isAlive: true,
        isHost: false, isMe: false, name: "everyone",
        settings: {
            cameraEnabled: false,
            microphoneEnabled: false
        }
    };

    @observable
    public participants = observable<ParticipantInformation>([this.system, this.everyone]);

    reset() {
        this.participants.replace([this.system, this.everyone]);
    }

    replace(array: Array<ParticipantInformation>){
        this.participants.replace([this.system, this.everyone, ...array]);
    }

    getById(id: string): ParticipantInformation | undefined {
        return this.participants?.find((participant: ParticipantInformation) => participant.id === id);
    }

    getIndexById(id: string): number | undefined {
        return this.participants?.findIndex((participant: ParticipantInformation) => participant.id === id);
    }

}


export default new ParticipantsStore();
