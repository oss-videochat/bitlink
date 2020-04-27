import {observable} from "mobx"
import {types} from "mediasoup-client";
import Participant from "../components/models/Participant";

class ParticipantsStore {

    public system: Participant = new Participant({
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
    });

    public everyone: Participant = new Participant( {
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
    });

    public participants = observable<Participant>([this.system, this.everyone]);

    public waitingRoom = observable<Participant>([]);


    getLiving(){
        return this.participants.filter(participant => participant.isAlive);
    }

    reset() {
        this.participants.replace([this.system, this.everyone]);
    }

    replace(array: Array<Participant>){
        this.participants.replace([this.system, this.everyone, ...array]);
    }

    getById(id: string): Participant | undefined {
        return this.participants?.find((participant: Participant) => participant.id === id);
    }

    getIndexById(id: string): number | undefined {
        return this.participants?.findIndex((participant: Participant) => participant.id === id);
    }

    removeFromWaitingRoom(id: string){
        const waitingRoomIndex: number = this.waitingRoom.findIndex(patientParticipant => patientParticipant.id === id);
        if(waitingRoomIndex >= 0){
            this.waitingRoom.splice(waitingRoomIndex, 1)
        }
    }

}


export default new ParticipantsStore();
