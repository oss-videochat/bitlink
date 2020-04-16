import * as Events from "events";
import * as mediasoup from "mediasoup";
import {config} from "../../config";
import * as pidusage from 'pidusage';

export class MediasoupWorkersGroup extends Events.EventEmitter {
    private msWorkers: Array<mediasoup.types.Worker> = [];

    constructor() {
        super();
    }

    async init() {
        for (let i = 0; i < config.mediasoup.numWorkers; i++) {
            const worker = await mediasoup.createWorker({
                logLevel: config.mediasoup.workerSettings.logLevel as mediasoup.types.WorkerLogLevel,
                logTags: config.mediasoup.workerSettings.logTags,
                rtcMinPort: Number(config.mediasoup.workerSettings.rtcMinPort),
                rtcMaxPort: Number(config.mediasoup.workerSettings.rtcMaxPort)
            });

            worker.on('died', () => {
                console.error('mediasoup Worker died, exiting  in 2 seconds... [pid:%d]', worker.pid);
                setTimeout(() => process.exit(1), 2000);
            });

            this.msWorkers.push(worker);

            // Log worker resource usage every X seconds.
            setInterval(async () => {
                const usage = await worker.getResourceUsage();
                console.info('mediasoup Worker resource usage [pid:%d]: %o', worker.pid, usage);
            }, 120000);
        }
    }

    async getLeastLoadedWorker() {
        const workerStats = await Promise.all(this.msWorkers.map( async (worker, index) => {
            return {
                stats: await this.getWorkerStats(worker),
                worker: worker
            }
        }));
        return workerStats.sort((w1, w2) => w1.stats.cpu - w2.stats.cpu)[0].worker;
    }

    async getGoodRouter(): Promise<mediasoup.types.Router> {
        const worker = await this.getLeastLoadedWorker();
        return await worker.createRouter(config.mediasoup.routerOptions as mediasoup.types.RouterOptions)
    }

    async getWorkerStats(worker) {
        const stats = await pidusage(worker._child.pid);
        return {
            pid: worker._child.pid,
            cpu: stats.cpu
        }
    }

    static async create() {
        const msW = new MediasoupWorkersGroup();
        await msW.init();
        return msW;
    }

}
