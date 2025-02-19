import sqlite from ".";

export type SqliteFile = {
  id?: number;
  name: string;
  date?: string;
  creator?: string;
  scrollPosition?: number;
  readSeconds: number;
  readPages: number;
  pages: number;
};
const sqliteFile = {
  async updateOrAdd(file: SqliteFile) {
    return sqlite
      .run(
        "INSERT OR REPLACE INTO file (id, name, date, creator, scrollPosition, readSeconds, readPages, pages) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *",
        {
          bind: [
            file.id,
            file.name,
            file.date,
            file.creator,
            file.scrollPosition,
            file.readSeconds,
            file.readPages,
            file.pages,
          ],
        }
      )
      .catch((error) => {
        console.error(error);
      });
  },
  async linkFileToCategory(fileId: number, categoryId: number) {
    return sqlite.run(
      "INSERT OR IGNORE INTO fileXcategory (fileId, categoryId) VALUES (?, ?)",
      {
        bind: [fileId, categoryId],
      }
    );
  },
  get(id: string) {
    return sqlite.run("SELECT * FROM file WHERE name = ?", {
      bind: [id],
    });
  },
  getFilesFromCategory(categoryId: number): Promise<{ results: SqliteFile[] }> {
    return sqlite.run(
      "SELECT * FROM file INNER JOIN fileXcategory ON file.id = fileXcategory.fileId WHERE fileXcategory.categoryId = ?",
      {
        bind: [categoryId],
      }
    );
  },
  getAll() {
    return sqlite.run("SELECT * FROM file");
  },
};

export default sqliteFile;
