import {observable} from "mobx";
import {types} from 'mediasoup-client'
import Participant, {ParticipantData} from "../components/models/Participant";

export interface CurrentUserInformation extends ParticipantData {
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

interface StreamsObject {
    video: MediaStream | null,
    audio: MediaStream | null,
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
            video: null,
            audio: null
        },
    };

    @observable
    public preferredInputs = {
        video: localStorage.getItem("preferred-video-input") ?? null,
        audio: localStorage.getItem("preferred-audio-input") ?? null,
    };

    private cachedStreams: StreamsObject = {
        video: null,
        audio: null
    };


    reset() {
        this.chosenName = undefined;
        this.info = undefined;
    }

    pause(kind: "video" | "audio") {
        this.mediasoup.producers[kind]?.pause();
        if (kind === "video") {
            this.info!.mediaState.cameraEnabled = false;
        } else {
            this.info!.mediaState.microphoneEnabled = false;
        }
    }

    resume(kind: "video" | "audio") {
        this.mediasoup.producers[kind]?.resume();
        if (kind === "video") {
            this.info!.mediaState.cameraEnabled = true;
        } else {
            this.info!.mediaState.microphoneEnabled = true;
        }
    }

    setPreferredInput(kind: "video" | "audio", deviceId: string | null) {
        this.preferredInputs[kind] = deviceId;
        if (!deviceId) {
            localStorage.removeItem(`preferred-${kind}-input`);
            return;
        }
        localStorage.setItem(`preferred-${kind}-input`, deviceId);
    }

    async getStream(type: "video" | "audio"): Promise<MediaStream> {
        const options = {
            video: {video: {facingMode: {ideal: "user"}, width: {ideal: 960}, height: {ideal: 640}}},
            audio: {audio: true}
        };

        const setPreferredInput = async () => {
            const stream: MediaStream = await navigator.mediaDevices.getUserMedia(options[type]);
            if (!stream) {
                throw `No ${type} device available`;
            }
            this.setPreferredInput(type, stream ? stream.getTracks()[0].getSettings().deviceId! : null);
            this.cachedStreams[type] = stream;
        }

        if (!this.preferredInputs[type]) {
            await setPreferredInput()
            return this.cachedStreams[type]!;
        }

        // we have a previously selected preferred
        if (!this.cachedStreams[type] || this.cachedStreams[type]!.getTracks()[0].getSettings().deviceId !== this.preferredInputs[type]) {
            this.cachedStreams[type] = await navigator.mediaDevices.getUserMedia({[type]: {deviceId: this.preferredInputs[type]!}});
        }

        if (!this.cachedStreams[type]) { // if its still not filled then that means that the preferredInputs is outdated
            await setPreferredInput();
        }

        this.preferredInputs[type] = this.cachedStreams[type]!.getTracks()[0].getSettings().deviceId!;

        return this.cachedStreams[type]!;
    }
}

export default new CurrentUserInformationStore();
