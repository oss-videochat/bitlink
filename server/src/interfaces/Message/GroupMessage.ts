import {Message} from "./Message";
import {Participant} from "../Participant";
import {MesssgeType} from '@bitlink/common';

export interface GroupMessage extends Message {
    type: MesssgeType.GROUP,
    group: Group,
    from: Participant,
}
