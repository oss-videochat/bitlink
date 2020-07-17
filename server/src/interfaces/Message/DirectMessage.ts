import {Message} from "./Message";
import {Participant} from "../Participant";
import {MesssgeType} from '@bitlink/common';

export interface DirectMessage extends Message {
    type: MesssgeType.DIRECT,
    to: Participant,
    from: Participant,
}
