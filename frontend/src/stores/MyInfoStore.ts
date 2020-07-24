import {computed, observable} from "mobx";
import {types} from 'mediasoup-client'
import {MediaSource, ParticipantRole, MediaSourceToTypeMap, MediaType, ParticipantSummary, TransportJob} from "@bitlink/common";

interface MediasoupObj {
    transports: {
        sending: types.Transport | null,
        receiving: types.Transport | null
    },
    producers: {
        camera: types.Producer | null,
        microphone: types.Producer | null,
        screen: types.Producer | null
    }
}

interface StreamsObject {
    camera: MediaStream | null,
    microphone: MediaStream | null,
}


class MyInfoStore {
    @observable public participant?: ParticipantSummary;
    public chosenName?: string;
    public transports: Record<TransportJob, types.Transport | null> = {
        sending: null,
        receiving: null
    }
    public producers: Record<MediaSource, types.Producer | null> = {
        camera: null,
        microphone: null,
        screen: null
    }
    public cachedStreams: Record< "camera" | "microphone", MediaStream | null> = {
        camera: null,
        microphone: null
    };

    @computed
    get isHost(){
        return this.participant?.role === ParticipantRole.HOST;
    }

    @observable public preferredInputs = {
        video: localStorage.getItem("preferred-video-input") ?? null,
        audio: localStorage.getItem("preferred-audio-input") ?? null,
    };

}
export default new MyInfoStore();
