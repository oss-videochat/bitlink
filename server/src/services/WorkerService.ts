import { config } from "../../config";
import * as mediasoup from "mediasoup";
import WorkerStore from "../stores/WorkerStore";
import * as pidusage from "pidusage";
import debug from "../helpers/debug";

const log = debug("Services:WorkerService");

class WorkerService {
    static async init() {
        for (let i = 0; i < config.mediasoup.numWorkers; i++) {
            const worker = await mediasoup.createWorker({
                logLevel: config.mediasoup.workerSettings
                    .logLevel as mediasoup.types.WorkerLogLevel,
                logTags: config.mediasoup.workerSettings.logTags as mediasoup.types.WorkerLogTag[],
                rtcMinPort: Number(config.mediasoup.workerSettings.rtcMinPort),
                rtcMaxPort: Number(config.mediasoup.workerSettings.rtcMaxPort),
            });

            worker.on("died", () => {
                console.error(
                    "mediasoup Worker died, exiting  in 2 seconds... [pid:%d]",
                    worker.pid
                );
                setTimeout(() => process.exit(1), 2000);
            });

            WorkerStore.msWorkers.push(worker);
            /*// Log worker resource usage every X seconds.
            setInterval(async () => {
                const usage = await worker.getResourceUsage();
                console.info('mediasoup Worker resource usage [pid:%d]: %o', worker.pid, usage);
            }, 120000);*/
        }
        log("Worker setup complete");
    }

    static async getLeastLoadedWorker() {
        const workerStats = await Promise.all(
            WorkerStore.msWorkers.map(async (worker, index) => {
                return {
                    stats: await WorkerService.getWorkerStats(worker),
                    worker: worker,
                };
            })
        );
        return workerStats.sort((w1, w2) => w1.stats.cpu - w2.stats.cpu)[0].worker;
    }

    static async getGoodRouter(): Promise<mediasoup.types.Router> {
        const worker = await WorkerService.getLeastLoadedWorker();
        return await worker.createRouter(
            config.mediasoup.routerOptions as mediasoup.types.RouterOptions
        );
    }

    static async getWorkerStats(worker: mediasoup.types.Worker) {
        // @ts-ignore
        const stats = await pidusage(worker._child.pid);
        return {
            // @ts-ignore
            pid: worker._child.pid,
            cpu: stats.cpu,
        };
    }
}

export default WorkerService;
