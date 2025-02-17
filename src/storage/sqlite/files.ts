import sqlite from ".";

export type SqliteFile = {
  id?: number;
  name: string;
};
const sqliteFile = {
  updateOrAdd(file: SqliteFile) {
    return sqlite
      .run("INSERT OR REPLACE INTO file (id, name) VALUES (?, ?) RETURNING *", {
        bind: [file.id, file.name],
      })
      .catch((error) => {
        console.error(error);
      });
  },
  get(id: string) {
    return sqlite.run("SELECT * FROM file WHERE name = ?", {
      bind: [id],
    });
  },
  getAll() {
    return sqlite.run("SELECT * FROM file");
  },
};

export default sqliteFile;
