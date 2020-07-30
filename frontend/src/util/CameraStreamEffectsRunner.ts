import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs-backend-webgl';
import {PersonInferenceConfig} from "@tensorflow-models/body-pix/dist/body_pix_model";

const bpModelPromise = bodyPix.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.50,
    quantBytes: 2
});


const segmentationProperties: PersonInferenceConfig = {
    flipHorizontal: false,
    internalResolution: "medium",
    segmentationThreshold: 0.9,
    scoreThreshold: 0.2,
    maxDetections: 1
};

class CameraStreamEffectsRunner {
    private bpModel: bodyPix.BodyPix;
    private stream: MediaStream;

    private tmpVideo = document.createElement("video");

    private videoRenderCanvas = document.createElement("canvas");
    private videoRenderCanvasCtx = this.videoRenderCanvas.getContext('2d')!;

    private bodyPixCanvas = document.createElement("canvas");
    private bodyPixCtx = this.bodyPixCanvas.getContext('2d')!;

    private finalCanvas = document.createElement("canvas");

    private previousSegmentationComplete = true;
    private lastSegmentation: bodyPix.SemanticPersonSegmentation | null = null;

    private shouldContinue = true;

    private imageData: ImageData | null = null;
    private blur: boolean = false;

    constructor(bpModel: bodyPix.BodyPix, stream: MediaStream, blur: boolean, image?: HTMLImageElement) {
        this.bpModel = bpModel;
        this.stream = stream;

        this.blur = blur;


        this.tmpVideo.addEventListener('loadedmetadata', () => {
            this.setNewSettings(blur, image);
            this.finalCanvas.width = this.tmpVideo.videoWidth;
            this.finalCanvas.height = this.tmpVideo.videoHeight;
            this.videoRenderCanvas.width = this.tmpVideo.videoWidth;
            this.videoRenderCanvas.height = this.tmpVideo.videoHeight;
            this.bodyPixCanvas.width = this.tmpVideo.videoWidth;
            this.bodyPixCanvas.height = this.tmpVideo.videoHeight;

            const finalCanvasCtx = this.finalCanvas.getContext('2d')!;
            finalCanvasCtx.drawImage(this.tmpVideo, 0, 0);
        });

        this.tmpVideo.srcObject = stream;

        this.tmpVideo.addEventListener('loadeddata', () => {
            this.tmpVideo.play();
            this.tick();
        });


        this.tmpVideo.srcObject = stream;

        this.finalCanvas.getContext('2d'); // firefox is stupid if we captureStream() without getting the context first

      /*  this.finalCanvas.style.position = "fixed";
        this.finalCanvas.style.left = "0";
        this.finalCanvas.style.top = "0";
        document.querySelector('body')!.appendChild(this.finalCanvas);*/
    }

    static async create(stream: MediaStream, blur: boolean, image?: HTMLImageElement) {
        const bpModel = await bpModelPromise;
        return new CameraStreamEffectsRunner(bpModel, stream, blur, image);
    }

    cancel() {
        this.shouldContinue = false;
    }

    private tick() {
        this.videoRenderCanvasCtx.drawImage(this.tmpVideo, 0, 0);
        if (this.previousSegmentationComplete) {
            this.previousSegmentationComplete = false;
            this.bpModel.segmentPerson(this.videoRenderCanvas, segmentationProperties).then(segmentation => {
                this.lastSegmentation = segmentation;
                this.previousSegmentationComplete = true;
            });
        }
        this.processSegmentation(this.lastSegmentation);
        if (this.shouldContinue) {
            setTimeout(this.tick.bind(this), 1000 / 60);
        }
    }

    private processSegmentation(segmentation: bodyPix.SemanticPersonSegmentation | null) {
        const ctx = this.finalCanvas.getContext('2d')!;
        const liveData = this.videoRenderCanvasCtx.getImageData(0, 0, this.videoRenderCanvas.width, this.videoRenderCanvas.height);
        if (segmentation) {
            if (this.blur) {
                bodyPix.drawBokehEffect(
                    this.finalCanvas,
                    this.videoRenderCanvas,
                    segmentation,
                    12, // Constant for background blur, integer values between 0-20
                    7 // Constant for edge blur, integer values between 0-20
                );
                return;
            }
            if(this.imageData) {
                const dataL = liveData.data;
                for (let x = 0; x < this.finalCanvas.width; x++) {
                    for (let y = 0; y < this.finalCanvas.height; y++) {
                        let n = y * this.finalCanvas.width + x;
                        if (segmentation.data[n] === 0) {
                            dataL[n * 4] = this.imageData!.data[n * 4];
                            dataL[n * 4 + 1] = this.imageData!.data[n * 4 + 1];
                            dataL[n * 4 + 2] = this.imageData!.data[n * 4 + 2];
                            dataL[n * 4 + 3] = this.imageData!.data[n * 4 + 3];
                        }
                    }
                }
            }
        }
        ctx.putImageData(liveData, 0, 0)
    }

    setNewSettings(blur: boolean, image?: HTMLImageElement){
        if (blur && image) {
            throw "I can't blur and replace image...well I can...but that would be stupid."
        }
        if(blur){
            this.blur = blur;
        }
        if(image){
            this.generateImageData(image);
        } else {
            this.imageData = null;
        }
    }

    private generateImageData(img: HTMLImageElement) {
        /**
         * https://stackoverflow.com/a/21961894/7886229
         * By Ken Fyrstenberg Nilsen
         *
         * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
         *
         * If image and context are only arguments rectangle will equal canvas
         */
        const canvas = document.createElement('canvas');
        canvas.height = this.tmpVideo.videoHeight;
        canvas.width = this.tmpVideo.videoWidth;
        const ctx = canvas.getContext('2d')!;
        const x = 0;
        const y = 0;
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        const offsetX = 0.5;
        const offsetY = 0.5;

        const iw = img.width;
        const ih = img.height;
        const r = Math.min(w / iw, h / ih);
        let nw = iw * r;   // new prop. width
        let nh = ih * r;  // new prop. height
        let cx, cy, cw, ch, ar = 1;

        // decide which gap to fill
        if (nw < w) ar = w / nw;
        if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
        nw *= ar;
        nh *= ar;

        // calc source rectangle
        cw = iw / (nw / w);
        ch = ih / (nh / h);

        cx = (iw - cw) * offsetX;
        cy = (ih - ch) * offsetY;

        // make sure source rectangle is valid
        if (cx < 0) cx = 0;
        if (cy < 0) cy = 0;
        if (cw > iw) cw = iw;
        if (ch > ih) ch = ih;

        // fill image in dest. rectangle
        ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);

        this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    getStream() {
        // @ts-ignore
        return this.finalCanvas.captureStream();
    }
}

export default CameraStreamEffectsRunner;
