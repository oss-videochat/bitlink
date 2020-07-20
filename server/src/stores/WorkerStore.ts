import * as mediasoup from "mediasoup";

class WorkerStore {
    msWorkers: mediasoup.types.Worker[] = [];
}

export default new WorkerStore();
