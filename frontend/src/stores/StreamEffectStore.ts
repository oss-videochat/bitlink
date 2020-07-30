import {observable} from "mobx";
import CameraStreamEffectsRunner from "../util/CameraStreamEffectsRunner";

class StreamEffectStore {
    @observable cameraStreamEffectRunner: CameraStreamEffectsRunner | null = null;
    @observable image: HTMLImageElement | null = null;
    @observable blur: boolean = false;
}
export default new StreamEffectStore();
