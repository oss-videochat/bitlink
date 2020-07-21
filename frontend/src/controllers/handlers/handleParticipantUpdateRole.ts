import {handleEvent} from "../../interfaces/handleEvent";
import {ParticipantRole} from "@bitlink/common";
import ParticipantsStore from "../../stores/ParticipantsStore";
import ChatStore from "../../stores/ChatStore";
import MyInfo from "../../stores/MyInfo";

interface handleParticipantUpdateRoleParam {
    participantId: string,
    newRole: ParticipantRole
}

export const handleParticipantUpdateRole: handleEvent<handleParticipantUpdateRoleParam> = ({participantId, newRole}, cb) => {
    const roleLookup = {
        [ParticipantRole.HOST]: 'host',
        [ParticipantRole.MANAGER]: 'manager',
        [ParticipantRole.MEMBER]: 'member'
    }

    const participant = ParticipantsStore.getById(participantId);
    if (participant) {
        ChatStore.addSystemMessage({content: `${participant.name} new role is ${roleLookup[participant.role]}`})
        participant.role = newRole;
    }
    if (participantId === MyInfo.info?.id) {
        MyInfo.info.role = newRole;
    }
};
