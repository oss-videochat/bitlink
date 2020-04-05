import {observable} from "mobx"
import {Reactions} from "../enum/Reactions";
import {ParticipantInformation} from "./ParticipantsStore";

export interface Reaction {
    type: Reactions,
    participant: ParticipantInformation;
}

export interface Message {
    id: string,
    from: ParticipantInformation | null,
    to: ParticipantInformation | "everyone" | null;
    content: string,
    reactions: Array<Reaction>
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
    reactions: Array<ReactionSummary>
}

export function getMessageById(id: string){
    return messagesStore.find((message: Message) =>  message.id = id);
}


export const messagesStore:  Array<Message> =  observable([]);
