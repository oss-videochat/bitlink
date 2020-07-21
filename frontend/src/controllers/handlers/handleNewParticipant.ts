import {handleEvent} from "../../interfaces/handleEvent";
import {ParticipantSummary} from "@bitlink/common";
import ParticipantsStore from "../../stores/ParticipantsStore";
import Participant from "../../models/Participant";
import NotificationStore, {NotificationType, UINotification} from "../../stores/NotificationStore";
import ChatStore from "../../stores/ChatStore";

interface handleNewParticipantParam {
    participantSummary: ParticipantSummary
}

export const handleNewParticipant: handleEvent<handleNewParticipantParam> = async ({participantSummary}, cb) => {
    ParticipantsStore.removeFromWaitingRoom(participantSummary.id);

    /* participantSummary.mediaState = {
         camera: false,
         screen: false,
         microphone: false
     };*/

    const participant = new Participant({
        ...participantSummary,
        mediasoup: {
            consumer: {
                camera: null,
                screen: null,
                microphone: null
            }
        }
    });
    ParticipantsStore.participants.push(participant);
    NotificationStore.add(new UINotification(`${participant.name} joined!`, NotificationType.Alert));
    ChatStore.addSystemMessage({content: `${participant.name} joined`});
};
