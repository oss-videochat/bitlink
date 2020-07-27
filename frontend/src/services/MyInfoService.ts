import MyInfoStore from "../stores/MyInfoStore";
import {MediaSource} from '@bitlink/common';

class MyInfoService {
    static reset() {
        MyInfoStore.chosenName = undefined;
        MyInfoStore.participant = undefined;
    }

    static pause(source: MediaSource) {
        MyInfoStore.producers[source]?.pause();
        MyInfoStore.participant!.mediaState[source] = false;
    }

    static resume(source: MediaSource) {
        MyInfoStore.producers[source]?.resume();
        MyInfoStore.participant!.mediaState[source] = true;
    }

    static close(source: MediaSource) {
        MyInfoStore.producers[source]?.close();
        MyInfoStore.producers[source] = null;
        MyInfoStore.participant!.mediaState[source] = false;
    }
}

export default MyInfoService;
