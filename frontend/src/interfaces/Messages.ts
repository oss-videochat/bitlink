import { Reactions } from "@bitlink/common";
import Participant from "../models/Participant";

export interface Reaction {
    type: Reactions;
    participant: Participant;
}
