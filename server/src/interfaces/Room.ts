import * as mediasoup from "mediasoup";
import {Participant} from "./Participant";
import {Message} from "./Message";
import {MessageGroup} from "./MessageGroup";

export interface RoomSettings {
    name: string
    waitingRoom: boolean,
}

export interface Room {
    id: string,
    idHash: string,
    messageGroups: MessageGroup[],
    participants: Participant[],
    waitingRoom: Participant[],
    messages: Message[];
    latestMessage: {
        [key: string]: number
    };
    created: Date,
    router: mediasoup.types.Router,
    settings: RoomSettings,
}
