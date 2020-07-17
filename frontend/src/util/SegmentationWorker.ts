export enum MessageType {
    SEGMENT
}

const SegmentationWorker = `
// @ts-ignore
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js");
// @ts-ignore
importScripts("https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.0");

let bpModelPromise = bodyPix.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.50,
    quantBytes: 2
});
const segmentationProperties = {
    flipHorizontal: false,
    internalResolution: "high",
    segmentationThreshold: 0.9,
    scoreThreshold: 0.2
};

onmessage = async (request) => {
    const bpModel = await bpModelPromise;
    switch (request.data.id) {
        case ${MessageType.SEGMENT}: {
            bpModel.segmentPerson(request.data.imageData, segmentationProperties).then(function (segmentation) {
                postMessage(segmentation.data);
            });
        }
    }
}`;

export const segmentationWorker = URL.createObjectURL(new Blob([ SegmentationWorker ], { type: 'application/javascript' }));
