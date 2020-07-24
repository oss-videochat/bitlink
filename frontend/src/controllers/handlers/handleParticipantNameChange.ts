import {handleEvent} from "../../interfaces/handleEvent";
import ParticipantsStore from "../../stores/ParticipantsStore";
import ParticipantService from "../../services/ParticipantService";

interface handleParticipantNameChangeParam {
    participantId: string,
    newName: string
}

export const handleParticipantNameChange: handleEvent<handleParticipantNameChangeParam> = ({participantId, newName}, cb) => {
    const participant = ParticipantService.getById(participantId);
    if (participant) {
        participant.info.name = newName;
    }
};
