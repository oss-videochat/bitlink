import StreamEffectStore from "../stores/StreamEffectStore";
import CameraStreamEffectsRunner from "../util/CameraStreamEffectsRunner";
import HardwareService from "./HardwareService";

class StreamEffectService {
    static async enableBlur() {
        StreamEffectStore.blur = true;
        StreamEffectStore.image = null;
        if (StreamEffectStore.cameraStreamEffectRunner) {
            StreamEffectStore.cameraStreamEffectRunner.setNewSettings(true);
        } else {
            StreamEffectStore.cameraStreamEffectRunner = await CameraStreamEffectsRunner.create(
                await HardwareService.getRawStream("camera"),
                true
            );
        }
    }

    static endEffects() {
        StreamEffectStore.blur = false;
        StreamEffectStore.image = null;
        if (StreamEffectStore.cameraStreamEffectRunner) {
            StreamEffectStore.cameraStreamEffectRunner.cancel();
        }
        StreamEffectStore.cameraStreamEffectRunner = null;
    }

    static async enableVirtualBackground(image: HTMLImageElement) {
        StreamEffectStore.blur = false;
        StreamEffectStore.image = image;
        if (StreamEffectStore.cameraStreamEffectRunner) {
            StreamEffectStore.cameraStreamEffectRunner.setNewSettings(false, image);
        } else {
            StreamEffectStore.cameraStreamEffectRunner = await CameraStreamEffectsRunner.create(
                await HardwareService.getRawStream("camera"),
                false,
                image
            );
        }
    }

    static async generateNewEffectRunner() {
        if (StreamEffectStore.cameraStreamEffectRunner) {
            StreamEffectStore.cameraStreamEffectRunner.cancel();
        }
        if (StreamEffectStore.image || StreamEffectStore.blur) {
            StreamEffectStore.cameraStreamEffectRunner = await CameraStreamEffectsRunner.create(
                await HardwareService.getRawStream("camera"),
                StreamEffectStore.blur,
                StreamEffectStore.image || undefined
            );
        } else {
            StreamEffectStore.cameraStreamEffectRunner = null;
        }
    }
}

export default StreamEffectService;
