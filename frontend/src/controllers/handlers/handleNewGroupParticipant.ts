import { handleEvent } from "../../interfaces/handleEvent";
import RoomService from "../../services/RoomService";
import ParticipantService from "../../services/ParticipantService";

interface handleNewGroupParticipantParam {
  groupId: string;
  participantId: string;
}

export const handleNewGroupParticipant: handleEvent<handleNewGroupParticipantParam> = ({
  groupId,
  participantId,
}) => {
  const group = RoomService.getGroup(groupId);
  const participant = ParticipantService.getById(participantId);
  if (group && participant) {
    group.members.push(participant);
  }
};
