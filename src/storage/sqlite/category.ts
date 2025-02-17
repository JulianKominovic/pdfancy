import sqlite from ".";

export type SqliteCategory = {
  id?: number;
  color: string;
  name: string;
  description: string;
};
const sqliteCategory = {
  updateOrAdd(category: SqliteCategory) {
    if (category.id) {
      return sqlite
        .run(
          "INSERT OR REPLACE INTO category (id, color, name, description) VALUES (?, ?, ?, ?) RETURNING *",
          {
            bind: [
              category.id,
              category.color,
              category.name,
              category.description,
            ],
          }
        )
        .catch((error) => {
          console.error(error);
        });
    } else {
      return sqlite
        .run(
          "INSERT OR REPLACE INTO category (color, name, description) VALUES (?, ?, ?) RETURNING *",
          {
            bind: [category.color, category.name, category.description],
          }
        )
        .catch((error) => {
          console.error(error);
        });
    }
  },
  get(name: string) {
    return sqlite.run("SELECT * FROM category WHERE name = ?", {
      bind: [name],
    });
  },
  getAll() {
    return sqlite.run("SELECT * FROM category");
  },
};

export default sqliteCategory;
