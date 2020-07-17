import * as bodyPix from '@tensorflow-models/body-pix';
import {SemanticPersonSegmentation} from "@tensorflow-models/body-pix";
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
    internalResolution: "high",
    segmentationThreshold: 0.9,
    scoreThreshold: 0.2,
    maxDetections: 1
};


export default async function runEffects(stream: MediaStream){
    //const worker = new Worker(segmentationWorker, {name: "Segmentation Worker"});

    const bpModel = await bpModelPromise;
    const tmpVideo = document.createElement("video");

    const videoRenderCanvas = document.createElement("canvas");
    const videoRenderCanvasCtx = videoRenderCanvas.getContext('2d')!;

    const bodyPixCanvas = document.createElement("canvas");
    const bodyPixCtx = bodyPixCanvas.getContext('2d')!;

    const finalCanvas = document.createElement("canvas");

    tmpVideo.addEventListener('loadedmetadata', function() {

        finalCanvas.width = tmpVideo.videoWidth;
        finalCanvas.height = tmpVideo.videoHeight;
        videoRenderCanvas.width = tmpVideo.videoWidth;
        videoRenderCanvas.height = tmpVideo.videoHeight;
        bodyPixCanvas.width = tmpVideo.videoWidth;
        bodyPixCanvas.height = tmpVideo.videoHeight;

        const finalCanvasCtx = finalCanvas.getContext('2d')!;
        finalCanvasCtx.drawImage(tmpVideo, 0, 0);
    });

    let previousSegmentationComplete = true;
    let lastSegmentation: any | null = null;

   /* worker.onmessage = (event) => {
        lastSegmentation = event.data;
        previousSegmentationComplete = true;
    };*/

    function predictWebcam() {
        videoRenderCanvasCtx.drawImage(tmpVideo, 0, 0);
        if (previousSegmentationComplete) {
            previousSegmentationComplete = false;
     /*       if(typeof OffscreenCanvas !== "undefined") {
                const liveData = videoRenderCanvasCtx.getImageData(0, 0, videoRenderCanvas.width, videoRenderCanvas.height);
                worker.postMessage({id: MessageType.SEGMENT, imageData: liveData});
            } else {*/
                bpModel.segmentPerson(videoRenderCanvas, segmentationProperties).then(function(segmentation) {
                    lastSegmentation = segmentation.data;
                    previousSegmentationComplete = true;
                });
           // }
        }
        processSegmentation(lastSegmentation);
        setTimeout(predictWebcam, 1000 / 60);
    }


    function processSegmentation(segmentation: any){
        const ctx = finalCanvas.getContext('2d')!;
        const liveData = videoRenderCanvasCtx.getImageData(0, 0, videoRenderCanvas.width, videoRenderCanvas.height);
        const dataL = liveData.data;

        if(segmentation){
            for (let x = 0; x < finalCanvas.width; x++) {
                for (let y = 0; y < finalCanvas.height; y++) {
                    let n = y * finalCanvas.width + x;
                    if (segmentation[n] === 0) {
                        dataL[n * 4] = 255;
                        dataL[n * 4 + 1] = 255;
                        dataL[n * 4 + 2] = 255;
                        dataL[n * 4 + 3] = 255;
                    }
                }
            }
        }
        ctx.putImageData(liveData, 0 ,0)
    }

    tmpVideo.srcObject = stream;

    tmpVideo.addEventListener('loadeddata', () => {
        tmpVideo.play();
        predictWebcam();
    });


    tmpVideo.srcObject = stream;

    finalCanvas.getContext('2d'); // firefox is stupid if we captureStream() without getting the contextFirst()
    /*finalCanvas.style.position = "fixed";
    finalCanvas.style.left = "0";
    finalCanvas.style.top = "0";
    document.querySelector('body')!.appendChild(finalCanvas);*/

    // @ts-ignore
    return finalCanvas.captureStream();
}
