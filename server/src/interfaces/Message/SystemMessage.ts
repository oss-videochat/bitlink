import {Message} from "./Message";
import {ParticipantRole, MesssgeType} from '@bitlink/common';

export interface SystemMessage extends Message {
    permission: ParticipantRole,
    type: MesssgeType.SYSTEM,
}
