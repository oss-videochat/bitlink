import { handleEvent } from "../../interfaces/handleEvent";
import ParticipantService from "../../services/ParticipantService";
import NotificationService from "../../services/NotificationService";
import { NotificationType } from "../../enum/NotificationType";

interface handleParticipantLeftParam {
  participantId: string;
}

export const handleParticipantLeft: handleEvent<handleParticipantLeftParam> = ({
  participantId,
}) => {
  const participant = ParticipantService.getById(participantId);
  if (participant) {
    participant.info.isAlive = false;
    NotificationService.add(
      NotificationService.createUINotification(
        `${participant.info.name} left!`,
        NotificationType.Alert
      )
    );
  }
  ParticipantService.removeFromWaitingRoom(participantId);
};
