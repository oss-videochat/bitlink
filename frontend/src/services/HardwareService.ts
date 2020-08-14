import MyInfoStore from "../stores/MyInfoStore";
import { MediaSource, MediaSourceToTypeMap, MediaType } from "@bitlink/common";
import StreamEffectStore from "../stores/StreamEffectStore";

class HardwareService {
  static setPreferredInput(kind: "video" | "audio", deviceId: string | null) {
    MyInfoStore.preferredInputs[kind] = deviceId;
    if (!deviceId) {
      localStorage.removeItem(`preferred-${kind}-input`);
      return;
    }
    localStorage.setItem(`preferred-${kind}-input`, deviceId);
  }

  static async getRawStream(source: MediaSource): Promise<MediaStream> {
    if (source === "screen") {
      // @ts-ignore
      // prettier-ignore
      return await navigator.mediaDevices.getDisplayMedia().catch((e) => console.error(e.toString()));
    }

    const mediaType = MediaSourceToTypeMap[source] as MediaType;

    const options = {
      video: {
        video: { facingMode: { ideal: "user" }, width: { ideal: 960 }, height: { ideal: 640 } },
      },
      audio: { audio: true },
    };

    const setPreferredInput = async () => {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia(options[mediaType]);
      if (!stream) {
        throw new Error(`No ${source} device available`);
      }
      HardwareService.setPreferredInput(
        mediaType,
        stream ? stream.getTracks()[0].getSettings().deviceId! : null
      );
      MyInfoStore.cachedStreams[source] = stream;
    };

    if (!MyInfoStore.preferredInputs[mediaType]) {
      await setPreferredInput();
      return MyInfoStore.cachedStreams[source]!;
    }

    // we have a previously selected preferred
    if (
      !MyInfoStore.cachedStreams[source] ||
      MyInfoStore.cachedStreams[source]!.getTracks()[0].readyState === "ended" ||
      MyInfoStore.cachedStreams[source]!.getTracks()[0].getSettings().deviceId !==
        MyInfoStore.preferredInputs[mediaType]
    ) {
      MyInfoStore.cachedStreams[source] = await navigator.mediaDevices.getUserMedia({
        [mediaType]: { deviceId: MyInfoStore.preferredInputs[mediaType]! },
      });
    }

    if (!MyInfoStore.cachedStreams[source]) {
      // if its still not filled then that means that the preferredInputs is outdated
      await setPreferredInput();
    }

    MyInfoStore.preferredInputs[mediaType] = MyInfoStore.cachedStreams[
      source
    ]!.getTracks()[0].getSettings().deviceId!;
    return MyInfoStore.cachedStreams[source]!;
  }

  static async getStream(source: MediaSource): Promise<MediaStream> {
    if (source === "camera" && StreamEffectStore.cameraStreamEffectRunner) {
      return StreamEffectStore.cameraStreamEffectRunner.getStream();
    }
    return await HardwareService.getRawStream(source);
  }
}

export default HardwareService;
