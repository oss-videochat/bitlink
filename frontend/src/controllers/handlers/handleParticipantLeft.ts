import {handleEvent} from "../../interfaces/handleEvent";
import Participant from "../../models/Participant";
import ParticipantsStore from "../../stores/ParticipantsStore";
import ChatStore from "../../stores/ChatStore";
import NotificationStore, {NotificationType, UINotification} from "../../stores/NotificationStore";

interface handleParticipantLeftParam {
    participantId: string
}

export const handleParticipantLeft: handleEvent<handleParticipantLeftParam> = ({participantId}) => {
    const participant: Participant | undefined = ParticipantsStore.getById(participantId);
    if (participant) {
        participant.isAlive = false;
        ChatStore.addSystemMessage({content: `${participant.name} left`});
        NotificationStore.add(new UINotification(`${participant.name} left!`, NotificationType.Alert));
    }
    ParticipantsStore.removeFromWaitingRoom(participantId);
};
