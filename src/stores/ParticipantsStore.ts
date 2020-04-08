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
    isMe: boolean
}

class ParticipantsStore {
    @observable
    public participants = observable<ParticipantInformation>([]);

    reset(){
        this.participants.clear();
    }

    getById(id: string): ParticipantInformation | undefined {
        return this.participants?.find((participant: ParticipantInformation) =>  participant.id === id);
    }

    getIndexById(id: string): number | undefined {
        return this.participants?.findIndex((participant: ParticipantInformation) =>  participant.id === id);
    }

}


export default new ParticipantsStore();
