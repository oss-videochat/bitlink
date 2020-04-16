import {ParticipantInformation} from "./ParticipantsStore";
import {observable} from "mobx";
import {types} from 'mediasoup-client'

export interface CurrentUserInformation extends ParticipantInformation {
    key: string
}

interface MediasoupObj {
    transports: {
        sending: types.Transport | null,
        receiving: types.Transport | null
    },
    producers: {
        video: types.Producer | null,
        audio: types.Producer | null
    }
}


class CurrentUserInformationStore {
    @observable
    public info?: CurrentUserInformation;
    public chosenName?: string;
    public mediasoup: MediasoupObj = {
        transports: {
            sending: null,
            receiving: null
        },
        producers: {
            video: null,
            audio: null
        },
    };


    reset() {
        this.chosenName = undefined;
        this.info = undefined;
    }

    async getVideoStream() {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        return stream.getVideoTracks()[0]
    }

    async getAudioStream() {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        return stream.getAudioTracks()[0]
    }
}

export default new CurrentUserInformationStore();
