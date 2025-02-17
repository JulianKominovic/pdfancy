import { getWorker } from "@/workers";

export type WorkerBusMessage<T = Record<string, any>> = {
  syncKey?: string;
  error?: Error;
} & T;

const workerBus = {
  async sync<T, U = any>(
    data: WorkerBusMessage<T>,
    timeout = 10_000
  ): Promise<WorkerBusMessage<U>> {
    const uuid = crypto.randomUUID();
    const worker = await getWorker();

    worker.postMessage({ ...data, syncKey: uuid });

    return new Promise((resolve, reject) => {
      worker.addEventListener(
        "message",
        (e) => {
          if (e.data.syncKey === uuid) {
            if (e.data.error) {
              reject(e.data.error);
            } else {
              resolve(e.data);
            }
          }
        },
        { signal: AbortSignal.timeout(timeout) }
      );
    });
  },
  async async<T>(data: WorkerBusMessage<T>) {
    const worker = await getWorker();

    worker.postMessage(data);
  },
};

export default workerBus;
