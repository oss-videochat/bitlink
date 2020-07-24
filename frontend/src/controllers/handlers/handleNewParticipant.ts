import {handleEvent} from "../../interfaces/handleEvent";
import {ParticipantSummary} from "@bitlink/common";
import ParticipantsStore from "../../stores/ParticipantsStore";
import Participant from "../../models/Participant";
import NotificationStore from "../../stores/NotificationStore";
import ChatStore from "../../stores/ChatStore";
import ParticipantService from "../../services/ParticipantService";
import NotificationService from "../../services/NotificationService";
import {NotificationType} from "../../enum/NotificationType";

interface handleNewParticipantParam {
    participantSummary: ParticipantSummary
}

export const handleNewParticipant: handleEvent<handleNewParticipantParam> =({participantSummary}, cb) => {
    ParticipantService.removeFromWaitingRoom(participantSummary.id);

    const participant = new Participant(participantSummary);
    ParticipantsStore.participants.push(participant);
    NotificationService.add(NotificationService.createUINotification(`${participant.info.name} joined!`, NotificationType.Alert));
};
