import {Reactions} from "../enum/Reactions";
import Participant from "../components/models/Participant";

export interface Reaction {
    type: Reactions,
    participant: Participant;
}

export interface Message {
    id: string,
    from: Participant,
    to: Participant,
    content: string,
    reactions: Array<Reaction>,
    created: number,
}

export interface ReactionSummary {
    type: Reactions,
    participant: string;
}

export interface MessageSummary {
    id: string,
    from: string,
    to: string | "everyone";
    content: string,
    reactions: Array<ReactionSummary>,
    created: number,
}
