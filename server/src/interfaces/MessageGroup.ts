import { Participant } from "./Participant";

export interface MessageGroup {
  id: string;
  name: string;
  members: Participant[];
}
