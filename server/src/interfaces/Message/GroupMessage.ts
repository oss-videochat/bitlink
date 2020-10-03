import { Message } from "./Message";
import { Participant } from "../Participant";
import { MessageType } from "@bitlink/common";
import { MessageGroup } from "../MessageGroup";

export interface GroupMessage extends Message {
    type: MessageType.GROUP;
    group: MessageGroup;
    from: Participant;
}
