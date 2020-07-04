import {observable} from "mobx";
import {types} from 'mediasoup-client'
import Participant, {ParticipantData} from "../models/Participant";
import {MediaSource, MediaType} from "@bitlink/common";
import {MediaSourceToTypeMap} from "@bitlink/common";

export interface CurrentUserInformation extends ParticipantData {
    key: string
}

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


class CurrentUserInformationStore {
    @observable
    public info?: Participant;
    public chosenName?: string;
    public mediasoup: MediasoupObj = {
        transports: {
            sending: null,
            receiving: null
        },
        producers: {
            camera: null,
            microphone: null,
            screen: null
        },
    };

    @observable
    public preferredInputs = {
        video: localStorage.getItem("preferred-video-input") ?? null,
        audio: localStorage.getItem("preferred-audio-input") ?? null,
    };

    private cachedStreams: StreamsObject = {
        camera: null,
        microphone: null
    };


    reset() {
        this.chosenName = undefined;
        this.info = undefined;
    }

    pause(source: MediaSource) {
        this.mediasoup.producers[source]?.pause();
        this.info!.mediaState[source] = false;
    }

    resume(source: MediaSource) {
        this.mediasoup.producers[source]?.resume();
        this.info!.mediaState[source] = true;
    }

    close(source: MediaSource){
        this.mediasoup.producers[source]?.close();
        this.mediasoup.producers[source] = null;
        this.info!.mediaState[source] = false;
    }

    setPreferredInput(kind: "video" | "audio", deviceId: string | null) {
        this.preferredInputs[kind] = deviceId;
        if (!deviceId) {
            localStorage.removeItem(`preferred-${kind}-input`);
            return;
        }
        localStorage.setItem(`preferred-${kind}-input`, deviceId);
    }

    async getStream(source: MediaSource): Promise<MediaStream> {
        if(source === "screen"){
            // @ts-ignore
            return await navigator.mediaDevices.getDisplayMedia().catch(e => console.error(e.toString()));
        }

        const mediaType = MediaSourceToTypeMap[source] as MediaType;

        const options = {
            video: {video: {facingMode: {ideal: "user"}, width: {ideal: 960}, height: {ideal: 640}}},
            audio: {audio: true}
        };

        const setPreferredInput = async () => {
            const stream: MediaStream = await navigator.mediaDevices.getUserMedia(options[mediaType]);
            if (!stream) {
                throw `No ${source} device available`;
            }
            this.setPreferredInput(mediaType, stream ? stream.getTracks()[0].getSettings().deviceId! : null);
            this.cachedStreams[source] = stream;
        }

        if (!this.preferredInputs[mediaType]) {
            await setPreferredInput()
            return this.cachedStreams[source]!;
        }

        // we have a previously selected preferred
        if (!this.cachedStreams[source] || this.cachedStreams[source]!.getTracks()[0].getSettings().deviceId !== this.preferredInputs[mediaType]) {
            this.cachedStreams[source] = await navigator.mediaDevices.getUserMedia({[mediaType]: {deviceId: this.preferredInputs[mediaType]!}});
        }

        if (!this.cachedStreams[source]) { // if its still not filled then that means that the preferredInputs is outdated
            await setPreferredInput();
        }

        this.preferredInputs[mediaType] = this.cachedStreams[source]!.getTracks()[0].getSettings().deviceId!;

        return this.cachedStreams[source]!;
    }
}

export default new CurrentUserInformationStore();
