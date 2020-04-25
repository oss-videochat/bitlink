import {observable} from "mobx"
import {types} from "mediasoup-client";

export interface MediaState {
    cameraEnabled: boolean,
    microphoneEnabled: boolean,
}

export interface ParticipantInformation {
    id: string,
    name: string,
    isHost: boolean,
    isMe: boolean,
    isAlive: boolean,
    mediaState: MediaState,
    mediasoup: {
        consumer: {
            video: types.Consumer | null,
            audio: types.Consumer | null
        }
    }
}

class ParticipantsStore {

    public system: ParticipantInformation = {
        id: "system",
        isAlive: true,
        isHost: false,
        isMe: false,
        name: "System",
        mediasoup: {
          consumer: {video: null, audio: null}
        },
        mediaState: {
            cameraEnabled: false,
            microphoneEnabled: false
        }
    };

    public everyone: ParticipantInformation = {
        id: "everyone",
        isAlive: true,
        isHost: false, isMe: false, name: "everyone",
        mediasoup: {
            consumer: {video: null, audio: null}
        },
        mediaState: {
            cameraEnabled: false,
            microphoneEnabled: false
        }
    };

    public participants = observable<ParticipantInformation>([this.system, this.everyone]);

    public waitingRoom = observable<ParticipantInformation>([]);


    getLiving(){
        return this.participants.filter(participant => participant.isAlive);
    }

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

    removeFromWaitingRoom(id: string){
        const waitingRoomIndex: number = this.waitingRoom.findIndex(patientParticipant => patientParticipant.id === id);
        if(waitingRoomIndex >= 0){
            this.waitingRoom.splice(waitingRoomIndex, 1)
        }
    }

}


export default new ParticipantsStore();
