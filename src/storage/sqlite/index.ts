import type {
  ExecBaseOptions,
  ExecReturnThisOptions,
  ExecRowModeArrayOptions,
} from "@sqlite.org/sqlite-wasm";

import workerBus from "../worker-bus";

export type SqliteWorkerRunMessage = {
  procedure: "run";
  query: string;
  opts?: (ExecBaseOptions & ExecRowModeArrayOptions & ExecReturnThisOptions) & {
    sql?: undefined;
  };
};
export type SqliteWorkerRunResponse = {
  procedure: "run";
  query: string;
  opts?: (ExecBaseOptions & ExecRowModeArrayOptions & ExecReturnThisOptions) & {
    sql?: undefined;
  };
  results: any[];
};
export type SqliteWorkerMessages = SqliteWorkerRunMessage;

const sqlite = {
  run(
    query: SqliteWorkerRunMessage["query"],
    opts?: SqliteWorkerRunMessage["opts"]
  ) {
    return workerBus.sync<SqliteWorkerRunMessage, SqliteWorkerRunResponse>({
      procedure: "run",
      query,
      opts,
    });
  },
};

export default sqlite;
