import {observable} from "mobx"
import Participant from "../models/Participant";
import {ParticipantRole} from "@bitlink/common";

class ParticipantsStore {

    public system: Participant = new Participant({
        id: "system",
        isAlive: true,
        role: ParticipantRole.MEMBER,
        name: "system",
        mediasoup: {
            consumer: {camera: null, microphone: null, screen: null}
        },
        mediaState: {
            camera: false,
            microphone: false,
            screen: false
        }
    });

    public everyone: Participant = new Participant({
        id: "everyone",
        isAlive: true,
        role: ParticipantRole.MEMBER,
        name: "everyone",
        mediasoup: {
            consumer: {camera: null, screen: null, microphone: null}
        },
        mediaState: {
            camera: false,
            microphone: false,
            screen: false
        }
    });

    public participants = observable<Participant>([this.system, this.everyone]);

    public waitingRoom = observable<Participant>([]);


    getLiving() {
        return this.participants.filter(participant => participant.isAlive);
    }

    reset() {
        this.participants.replace([this.system, this.everyone]);
    }

    replace(array: Array<Participant>) {
        this.participants.replace([this.system, this.everyone, ...array]);
    }

    getById(id: string): Participant | undefined {
        return this.participants?.find((participant: Participant) => participant.id === id);
    }

    getIndexById(id: string): number | undefined {
        return this.participants?.findIndex((participant: Participant) => participant.id === id);
    }

    removeFromWaitingRoom(id: string) {
        const waitingRoomIndex: number = this.waitingRoom.findIndex(patientParticipant => patientParticipant.id === id);
        if (waitingRoomIndex >= 0) {
            this.waitingRoom.splice(waitingRoomIndex, 1)
        }
    }

    filterByMentionString(mentionString: string): Participant[] {
        mentionString = mentionString.toLowerCase();
        if (mentionString[0] === "@") {
            mentionString = mentionString.substring(1);
        }
        return this.participants
            .slice(2)
            .filter(participant =>
                participant
                    .mentionString
                    .toLowerCase()
                    .startsWith(mentionString)
            );
    }

}


export default new ParticipantsStore();
