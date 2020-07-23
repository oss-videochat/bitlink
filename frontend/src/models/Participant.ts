import {types} from "mediasoup-client";
import {computed, observable} from 'mobx';
import {MediaSource, MediaState, ParticipantRole, ParticipantSummary} from "@bitlink/common";


export interface ParticipantData {
    id: string,
    name: string,
    isHost: boolean,
    isMe: boolean,
    isAlive: boolean,
    mediaState: MediaState,
    mediasoup: {
        consumer: {
            [key in MediaSource]: types.Consumer | null
        }
    }
}

export default class Participant {
    @observable info: ParticipantSummary;
    @observable consumers: { [key in MediaSource]: types.Consumer | null } = {
        camera: null,
        microphone: null,
        screen: null
    };

    constructor(data: ParticipantSummary) {
        this.info = data;
    }

    @computed
    get mentionString(){
        return this.info.name.replace(/\s+/g, '');
    }

    @computed
    get isHost(){
        return this.info.role === ParticipantRole.HOST;
    }

    @computed
    get hasVideo(): boolean {
        return this.info.mediaState.camera && !!this.consumers.camera
    }

    @computed
    get hasAudio(): boolean {
        return this.info.mediaState.microphone && !!this.consumers.microphone
    }

    @computed
    get hasScreen(): boolean {
        return this.info.mediaState.screen && !!this.consumers.screen
    }
}
