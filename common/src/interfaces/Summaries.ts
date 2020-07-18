import {MediaState, MessageType, ParticipantRole, Reactions} from "..";
import {Message} from "../../../server/src/interfaces/Message";
import {MessageGroup} from "../../../server/src/interfaces/MessageGroup";
import {Participant} from "../../../server/src/interfaces/Participant";

export interface RoomSummary {
    id: string,
    idHash: string,
    name: string,
    myId: string
    participants: Array<ParticipantSummary>,
    messages: Array<MessageSummary>,
}

export interface ParticipantSummary {
    id: string,
    name: string,
    role: ParticipantRole,
    isAlive: boolean,
    mediaState: MediaState
}

export interface MessageSummary {
    id: string,
    content: string,
    created: number,
    type: MessageType
}

export interface SystemMessageSummary extends MessageSummary {
    permission: ParticipantRole,
    type: MessageType.SYSTEM,
}

export interface GroupMessageSummary extends MessageSummary {
    type: MessageType.GROUP,
    group: number,
    from: number,
}

export interface DirectMessageSummary extends MessageSummary {
    type: MessageType.DIRECT,
    to: number,
    from: number,
}

export interface ReactionSummary {
    type: Reactions,
    participant: string,
}
