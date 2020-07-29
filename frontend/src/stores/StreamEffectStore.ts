import {observable} from "mobx";

class StreamEffectStore {
    @observable virtualBackground: boolean = false;
    @observable virtualBackgroundImage: HTMLImageElement | null = null;
    @observable virtualBackgroundImageData: ImageData | null = null;
    @observable blurBackground: boolean = false;
}
export default new StreamEffectStore();
