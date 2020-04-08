import {observable} from "mobx"
import {Reactions} from "../enum/Reactions";
import {ParticipantInformation} from "./ParticipantsStore";

export interface Reaction {
    type: Reactions,
    participant: ParticipantInformation;
}

export interface Message {
    id: string,
    from: ParticipantInformation,
    to: ParticipantInformation | "everyone",
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

interface MessageLike {

}

class MessagesStore {
    @observable
    public messages = observable<Message>([]);

    reset(){
        this.messages.clear();
    }

    getMessageById(id: string): Message | undefined {
        return this.messages.find((message: Message) =>  message.id = id);
    }

    getIndexMessageById(id: string): number | undefined {
        return this.messages.findIndex((message: Message) =>  message.id = id);
    }
}


export default MessagesStore;
