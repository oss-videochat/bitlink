import {handleEvent} from "../../interfaces/handleEvent";
import ParticipantsStore from "../../stores/ParticipantsStore";

interface handleParticipantNameChangeParam {
    participantId: string,
    newName: string
}

export const handleParticipantNameChange: handleEvent<handleParticipantNameChangeParam> = async ({participantId, newName}, cb) => {
    const participant = ParticipantsStore.getById(participantId);
    if (participant) {
        participant.name = newName;
    }
};
