import {MediaState} from "./WebRTC";
import {ParticipantRole} from "../enum/ParticipantRole";

export interface ParticipantSummary {
    id: string,
    name: string,
    role: ParticipantRole,
    isAlive: boolean,
    mediaState: MediaState
}
