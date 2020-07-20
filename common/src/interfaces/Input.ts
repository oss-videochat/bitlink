import {MessageType} from "..";

export interface MessageInput {
    content: string,
    type: MessageType
}

export interface DirectMessageInput extends MessageInput {
    to: string,
}

export interface GroupMessageInput extends MessageInput {
    group: string,
}
