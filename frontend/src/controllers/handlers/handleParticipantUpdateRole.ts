import { handleEvent } from "../../interfaces/handleEvent";
import { ParticipantRole } from "@bitlink/common";
import MyInfo from "../../stores/MyInfoStore";
import ParticipantService from "../../services/ParticipantService";

interface handleParticipantUpdateRoleParam {
  participantId: string;
  newRole: ParticipantRole;
}

export const handleParticipantUpdateRole: handleEvent<handleParticipantUpdateRoleParam> = (
  { participantId, newRole },
  cb
) => {
  const roleLookup = {
    [ParticipantRole.HOST]: "host",
    [ParticipantRole.MANAGER]: "manager",
    [ParticipantRole.MEMBER]: "member",
  };

  const participant = ParticipantService.getById(participantId);
  if (participant) {
    participant.info.role = newRole;
  }
  if (participantId === MyInfo.participant!.id) {
    MyInfo.participant!.role = newRole;
  }
};
