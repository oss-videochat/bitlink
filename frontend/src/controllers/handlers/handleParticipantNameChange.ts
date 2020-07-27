import {handleEvent} from "../../interfaces/handleEvent";
import ParticipantService from "../../services/ParticipantService";
import MyInfoStore from "../../stores/MyInfoStore";

interface handleParticipantNameChangeParam {
    participantId: string,
    newName: string
}

export const handleParticipantNameChange: handleEvent<handleParticipantNameChangeParam> = ({participantId, newName}, cb) => {
    const participant = ParticipantService.getById(participantId);
    if (participant) {
        if (participant.info.id === MyInfoStore.participant!.id) {
            MyInfoStore.participant!.name = newName
        }
        participant.info.name = newName;
    }
};
