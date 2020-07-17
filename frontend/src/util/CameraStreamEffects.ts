import * as bodyPix from '@tensorflow-models/body-pix';
import {SemanticPersonSegmentation} from "@tensorflow-models/body-pix";
import '@tensorflow/tfjs-backend-webgl';

const bpModelPromise = bodyPix.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.50,
    quantBytes: 2
});


const segmentationProperties = {
    flipHorizontal: false,
    internalResolution: "high" as any,
    segmentationThreshold: 0.9,
    scoreThreshold: 0.2
};


export default async function runEffects(stream: MediaStream){
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
    let lastSegmentation: SemanticPersonSegmentation | null = null;

    function predictWebcam() {
        videoRenderCanvasCtx.drawImage(tmpVideo, 0, 0);
        if (previousSegmentationComplete) {
            previousSegmentationComplete = false;
            // Now classify the canvas image we have available.
           bpModel.segmentPerson(videoRenderCanvas, segmentationProperties).then(function(segmentation) {
                lastSegmentation = segmentation;
                previousSegmentationComplete = true;
            });
        }
        processSegmentation(lastSegmentation);
        setTimeout(predictWebcam, 0);
    }


    function processSegmentation(segmentation: SemanticPersonSegmentation | null){
        const ctx = finalCanvas.getContext('2d')!;
        const liveData = videoRenderCanvasCtx.getImageData(0, 0, videoRenderCanvas.width, videoRenderCanvas.height);
        const dataL = liveData.data;

        if(segmentation){
            for (let x = 0; x < finalCanvas.width; x++) {
                for (let y = 0; y < finalCanvas.height; y++) {
                    let n = y * finalCanvas.width + x;
                    // Human pixel found. Update bounds.
                    if (segmentation.data[n] === 0) {
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

    finalCanvas.getContext('2d');
    finalCanvas.style.position = "fixed";
    finalCanvas.style.left = "0";
    finalCanvas.style.top = "0";
    document.querySelector('body')!.appendChild(finalCanvas);

    // @ts-ignore
    return finalCanvas.captureStream();
}
