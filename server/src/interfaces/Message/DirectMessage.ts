import { Message } from "./Message";
import { Participant } from "../Participant";
import { MessageType } from "@bitlink/common";

export interface DirectMessage extends Message {
  type: MessageType.DIRECT;
  to: Participant;
  from: Participant;
}
