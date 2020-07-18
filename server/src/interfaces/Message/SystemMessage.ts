import {Message} from "./Message";
import {ParticipantRole, MessageType} from '@bitlink/common';

export interface SystemMessage extends Message {
    permission: ParticipantRole,
    type: MessageType.SYSTEM,
}
