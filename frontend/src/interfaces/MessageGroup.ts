import Participant from "../models/Participant";

export interface MessageGroup {
  id: string;
  name: string;
  members: Participant[];
}
