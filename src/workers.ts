const worker = new Worker("/worker.js", { type: "module" });
let workerIsReady = false;

export async function getWorker(): Promise<Worker> {
  if (workerIsReady) return worker;

  return new Promise((resolve) => {
    function ready(e: MessageEvent<any>) {
      if (e.data.procedure === "ready") {
        worker.removeEventListener("message", ready);
        workerIsReady = true;
        resolve(worker);
      }
    }
    worker.addEventListener("message", ready);
  });
}
