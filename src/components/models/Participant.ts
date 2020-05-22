import {types} from "mediasoup-client";
import {computed, observable} from 'mobx';

export interface MediaState {
    cameraEnabled: boolean,
    microphoneEnabled: boolean,
}

export interface ParticipantData {
    id: string,
    name: string,
    isHost: boolean,
    isMe: boolean,
    isAlive: boolean,
    mediaState: MediaState,
    mediasoup: {
        consumer: {
            video: types.Consumer | null,
            audio: types.Consumer | null
        }
    }
}

export default class Participant {
    @observable id: string;
    @observable name: string;
    @observable isHost: boolean;
    @observable isMe: boolean;
    @observable isAlive: boolean;
    @observable mediaState: MediaState;
    @observable mediasoup: {
        consumer: {
            video: types.Consumer | null,
            audio: types.Consumer | null
        }
    };

    constructor(data: ParticipantData) {
        this.id = data.id;
        this.name = data.name;
        this.isHost = data.isHost;
        this.isMe = data.isMe;
        this.isAlive = data.isAlive;
        this.mediaState = data.mediaState;
        this.mediasoup = data.mediasoup;
    }

    @computed
    get hasVideo(): boolean {
        return this.mediaState.cameraEnabled && !!this.mediasoup.consumer.video
    }

    @computed
    get hasAudio(): boolean {
        return this.mediaState.microphoneEnabled && !!this.mediasoup.consumer.audio
    }
}
