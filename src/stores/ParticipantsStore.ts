import {observable} from "mobx"

interface UserSettings {
    cameraEnabled: boolean,
    microphoneEnabled: boolean,
}

export interface ParticipantInformation {
    id: string,
    name: string,
    settings: UserSettings,
    isHost: boolean,
    isMe: boolean
}

export const participantStore =  observable<ParticipantInformation>([]);

export function findById(id: string): ParticipantInformation | undefined {
    return participantStore.find((participant: ParticipantInformation) => {
        return participant.id === id;
    });
}
