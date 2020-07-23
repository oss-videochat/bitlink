import MyInfo from "../stores/MyInfoStore";
import Participant from "../models/Participant";
import ParticipantsStore from "../stores/ParticipantsStore";

class ParticipantService {
    static getLiving(excludeSelf = false) {
        return ParticipantsStore.participants.filter(participant => participant.info.isAlive && (excludeSelf ? participant.info.id !== MyInfo.participant.info.id : true));
    }

    static reset() {
        ParticipantsStore.participants = [];
    }

    static replace(array: Array<Participant>) {
        ParticipantsStore.participants = [];
    }

    static getById(id: string) {
        return ParticipantsStore.participants.find((participant: Participant) => participant.info.id === id);
    }

    static getIndexById(id: string) {
        return ParticipantsStore.participants?.findIndex((participant: Participant) => participant.info.id === id);
    }

    static removeFromWaitingRoom(id: string) {
        const waitingRoomIndex: number = ParticipantsStore.waitingRoom.findIndex(patientParticipant => patientParticipant.info.id === id);
        if (waitingRoomIndex >= 0) {
            ParticipantsStore.waitingRoom.splice(waitingRoomIndex, 1)
        }
    }

    static filterByMentionString(mentionString: string): Participant[] {
        mentionString = mentionString.toLowerCase();
        if (mentionString[0] === "@") {
            mentionString = mentionString.substring(1);
        }
        return ParticipantsStore.participants
            .slice(2)
            .filter(participant =>
                participant
                    .mentionString
                    .toLowerCase()
                    .startsWith(mentionString) // we need to sort
            );
    }

    static getByMentionString(mentionString: string) {
        mentionString = mentionString.toLowerCase();
        if (mentionString[0] === "@") {
            mentionString = mentionString.substring(1);
        }
        return ParticipantsStore.participants
            .slice(2)
            .filter(participant => participant.mentionString.toLowerCase() === mentionString);
    }
}

export default ParticipantService
