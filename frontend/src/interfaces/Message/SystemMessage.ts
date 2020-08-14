import { Message } from "./Message";
import { MessageType, ParticipantRole } from "@bitlink/common";

export interface SystemMessage extends Message {
  permission: ParticipantRole;
  type: MessageType.SYSTEM;
}
