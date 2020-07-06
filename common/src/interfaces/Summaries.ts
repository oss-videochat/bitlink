import {MediaState, ParticipantRole, Reactions} from "..";

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
    id: string, // message id for editing, deleting, and reactions
    from: string, // id of participant
    to: string, // id of participant
    message: string, // id of message
    content: string,
    reactions: Array<ReactionSummary>,
    created: number
}

export interface ReactionSummary {
    type: Reactions,
    participant: string,
}
