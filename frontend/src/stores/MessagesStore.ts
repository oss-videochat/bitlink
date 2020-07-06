import {Reactions} from "@bitlink/common";
import Participant from "../models/Participant";

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
