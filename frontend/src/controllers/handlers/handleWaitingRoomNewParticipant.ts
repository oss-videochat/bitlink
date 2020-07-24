import {handleEvent} from "../../interfaces/handleEvent";
import Participant from "../../models/Participant";
import ParticipantsStore from "../../stores/ParticipantsStore";
import {ParticipantSummary} from "@bitlink/common";

interface handleWaitingRoomNewParticipantParam {
    participant: ParticipantSummary
}

export const handleWaitingRoomNewParticipant: handleEvent<handleWaitingRoomNewParticipantParam> = ({participant}, cb) => {
    ParticipantsStore.waitingRoom.push(new Participant(participant));
};
