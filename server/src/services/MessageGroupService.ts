import {v4 as uuidv4} from "uuid";
import {MessageGroup} from "../interfaces/MessageGroup";
import {Participant} from "../interfaces/Participant";
import {MessageGroupSummary} from "@bitlink/common";

class MessageGroupService {
    static create(name: string) {
        return {
            id: uuidv4(),
            name: name,
            members: []
        }
    }

    static addParticipant(messageGroup: MessageGroup, participant: Participant) {
        messageGroup.members.forEach(participant => {
            if (!participant.isConnected) {
                return;
            }
            participant.socket.emit("participant-joined-group", {
                groupId: messageGroup.id,
                participantId: participant.id
            });
        });
        messageGroup.members.push(participant);
        participant.socket.emit("added-to-group", {groupSummary: MessageGroupService.getSummary(messageGroup)});
    }

    static changeName(messageGroup: MessageGroup, newName: string) {
        messageGroup.members.forEach(participant => {
            participant.socket.emit("group-update-name", {groupId: messageGroup.id, newName});
        });
    }

    static getSummary(messageGroup: MessageGroup): MessageGroupSummary {
        return {
            id: messageGroup.id,
            name: messageGroup.name,
            members: messageGroup.members.map(member => member.id)
        }
    }
}

export default MessageGroupService;
