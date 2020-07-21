import {handleEvent} from "../../interfaces/handleEvent";
import Participant, {ParticipantData} from "../../models/Participant";
import ParticipantsStore from "../../stores/ParticipantsStore";

interface handleWaitingRoomNewParticipantParam {
    participant: ParticipantData
}

export const handleWaitingRoomNewParticipant: handleEvent<handleWaitingRoomNewParticipantParam> = async ({participant}, cb) => {
    ParticipantsStore.waitingRoom.push(new Participant(participant));
};
