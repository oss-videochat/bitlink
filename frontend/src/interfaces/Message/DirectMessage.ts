import {Message} from "./Message";
import {MessageType} from '@bitlink/common';
import Participant from "../../models/Participant";

export interface DirectMessage extends Message {
    type: MessageType.DIRECT,
    to: Participant,
    from: Participant,
}
