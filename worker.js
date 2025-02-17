/* eslint-disable no-console */
// In `worker.js`.
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
function log(...args) {
  console.log(
    "%c[SQLITE WORKER]",
    "color: white; background-color: #3d3d3d;",
    ...args
  );
}
/**
 * @type {import("@sqlite.org/sqlite-wasm").Database | null}
 */
let db = null;

function ignoreErrors(fn) {
  try {
    return fn();
  } catch (error) {
    console.warn("Ignoring error...", error);
  }
}

const initializeSQLite = async () => {
  try {
    log("Loading and initializing SQLite3 module...");
    const sqlite3 = await sqlite3InitModule({
      print: (...args) => log(...args),
      printErr: (...args) => console.error(...args),
    });

    log("Done initializing. Running demo...");
    log("Running SQLite3 version", sqlite3.version.libVersion);
    db =
      "opfs" in sqlite3
        ? new sqlite3.oo1.OpfsDb("/pdfancy-v1.sqlite3")
        : new sqlite3.oo1.DB("/pdfancy-v1.sqlite3", "ct");
    log(
      "opfs" in sqlite3
        ? `OPFS is available, created persisted database at ${db.filename}`
        : `OPFS is not available, created transient database ${db.filename}`
    );

    //  Create table category
    db.exec({
      sql: "CREATE TABLE IF NOT EXISTS category (id INTEGER PRIMARY KEY AUTOINCREMENT);",
    });
    ignoreErrors(() =>
      db.exec({
        sql: "ALTER TABLE category ADD COLUMN name TEXT;",
      })
    );
    ignoreErrors(() =>
      db.exec({
        sql: "ALTER TABLE category ADD COLUMN color TEXT;",
      })
    );
    ignoreErrors(() =>
      db.exec({
        sql: "ALTER TABLE category ADD COLUMN description TEXT;",
      })
    );
    // Create table file
    db.exec({
      sql: "CREATE TABLE IF NOT EXISTS file (id INTEGER PRIMARY KEY AUTOINCREMENT);",
    });
    ignoreErrors(() =>
      db.exec({
        sql: "ALTER TABLE file ADD COLUMN name TEXT;",
      })
    );

    // Log tables
    const tables = db.exec({
      sql: "SELECT name FROM sqlite_master WHERE type='table';",
      returnValue: "resultRows",
      rowMode: "object",
    });

    log("Tables:", tables);
    // Log every row in each table
    tables.forEach((table) => {
      const rows = db.exec({
        sql: `SELECT * FROM ${table.name};`,
        returnValue: "resultRows",
        rowMode: "object",
      });

      log(`Rows in ${table.name}:`, rows);
    });
  } catch (err) {
    console.error("Initialization error:", err.name, err.message);
  }
};

initializeSQLite().then(() => {
  log("Database initialized");

  self.addEventListener("message", async (event) => {
    log("Message from main thread:", event.data);
    /**
     * @type {import("./src/storage/sqlite").SqliteWorkerMessages}
     */
    const data = event.data;
    const { procedure, syncKey, ...args } = data;

    log("Message from main thread:", event.data);

    const response = await new Promise((resolve, reject) => {
      switch (procedure) {
        case "run":
          if (db) {
            log("Running SQL:", args);
            const { query, opts } = args;

            const results = db.exec({
              sql: query,
              ...opts,
              // Importante esto
              returnValue: "resultRows",
              // Importante esto
              rowMode: "object",
            });

            resolve({ results });
          }
          break;
        case "cache-add":
        // const cachedResponse = caches
        //   .match(event.request)
        //   .then((r) => (r !== undefined ? r : fetch(event.request)))
        //   .then((r) => {
        //     response = r;
        //     caches.open("v1").then((cache) => {
        //       cache.put(event.request, response);
        //     });
        //     return response.clone();
        //   })
        //   .catch(() => caches.match("/gallery/myLittleVader.jpg"));
        default:
          log("Unknown procedure");
          reject(new Error("Unknown procedure"));
      }
    });

    self.postMessage({ procedure, ...response, syncKey });
  });
  self.postMessage({ procedure: "ready" });
});
