import { computed, observable } from "mobx";
import { types } from "mediasoup-client";
import { MediaSource, ParticipantRole, ParticipantSummary, TransportJob } from "@bitlink/common";

interface MediasoupObj {
    transports: {
        sending: types.Transport | null;
        receiving: types.Transport | null;
    };
    producers: {
        camera: types.Producer | null;
        microphone: types.Producer | null;
        screen: types.Producer | null;
    };
}

interface StreamsObject {
    camera: MediaStream | null;
    microphone: MediaStream | null;
}

class MyInfoStore {
    @observable public participant?: ParticipantSummary;
    public chosenName?: string;
    public transports: Record<TransportJob, types.Transport | null> = {
        sending: null,
        receiving: null,
    };
    public producers: Record<MediaSource, types.Producer | null> = {
        camera: null,
        microphone: null,
        screen: null,
    };
    public cachedStreams: Record<"camera" | "microphone", MediaStream | null> = {
        camera: null,
        microphone: null,
    };
    @observable public preferredInputs = {
        video: localStorage.getItem("preferred-video-input") ?? null,
        audio: localStorage.getItem("preferred-audio-input") ?? null,
    };

    @computed
    get isHost() {
        return this.participant?.role === ParticipantRole.HOST;
    }
}

export default new MyInfoStore();
