import {types} from "mediasoup-client";
import {computed, observable} from 'mobx';
import {MediaState, MediaSource} from "@bitlink/common";
import {ParticipantRole} from "@bitlink/common";


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
    @observable id: string;
    @observable name: string;
    @observable role: ParticipantRole;
    @observable isAlive: boolean;
    @observable mediaState: MediaState;
    @observable mediasoup: {
        consumer: {
            [key in MediaSource]: types.Consumer | null
        }
    };
    constructor(data: Partial<Participant>) {
        this.id = data.id!;
        this.name = data.name!;
        this.role = data.role!;
        this.isAlive = data.isAlive!;
        this.mediaState = data.mediaState!;
        this.mediasoup = data.mediasoup!;
    }

    @computed
    get mentionString(){
        return this.name.replace(/\s+/g, '');
    }

    @computed
    get isHost(){
        return this.role === ParticipantRole.HOST;
    }

    @computed
    get hasVideo(): boolean {
        return this.mediaState.camera && !!this.mediasoup.consumer.camera
    }

    @computed
    get hasAudio(): boolean {
        return this.mediaState.microphone && !!this.mediasoup.consumer.microphone
    }

    @computed
    get hasScreen(): boolean {
        return this.mediaState.screen && !!this.mediasoup.consumer.screen
    }
}
