import { create } from "zustand";

import sqliteCategory, { SqliteCategory } from "@/storage/sqlite/category";
import sqliteFile, { SqliteFile } from "@/storage/sqlite/files";
import vFilesCache from "@/storage/cache/files";

type CategoriesStore = {
  categories: (SqliteCategory & { files: SqliteFile[]; fileCount?: number })[];
  setCategories: (
    categories: (SqliteCategory & { files: SqliteFile[]; fileCount?: number })[]
  ) => void;
  updateOrAddCategory: (
    category: SqliteCategory & { files: SqliteFile[]; fileCount?: number }
  ) => Promise<{} | SqliteCategory>;
  addFileToCategory: (
    file: SqliteFile,
    fileFile: File,
    categoryId: number
  ) => Promise<void>;
};

const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  categories: [],
  setCategories(categories) {
    set({ categories });
  },
  async updateOrAddCategory(category) {
    const response = await sqliteCategory.updateOrAdd(category);

    if (!response) return {};
    const updatedCategory = response.results[0];

    if (!updatedCategory) return {};
    let oldCategories = get().categories;

    if (oldCategories.find((c) => c.id === category.id)) {
      set({
        categories: oldCategories.map((c) =>
          c.id === updatedCategory.id ? { ...c, ...updatedCategory } : c
        ),
      });
    } else {
      set({
        categories: [...oldCategories, updatedCategory as any],
      });
    }

    return updatedCategory;
  },
  async addFileToCategory(
    fileSqlite: SqliteFile,
    file: File,
    categoryId: number
  ) {
    const response = await sqliteFile.updateOrAdd(fileSqlite);

    if (response) {
      const result = response.results[0];
      const fileId = result.id;
      await vFilesCache.addFile(file, fileId);
      if (categoryId) await sqliteFile.linkFileToCategory(fileId, categoryId);
      set({
        categories: get().categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                files: [...c.files, result as any],
                fileCount: c.fileCount ? c.fileCount + 1 : 1,
              }
            : c
        ),
      });
    }
  },
}));

async function fetchCategories() {
  const categories: (SqliteCategory & { files: SqliteFile[] })[] = [];
  const { results } = await sqliteCategory.getAll();
  for (const r of results) {
    const files = await sqliteFile.getFilesFromCategory(r.id as number);
    categories.push({
      ...r,
      files: files.results,
    });
  }
  console.log("Ingesting categories", categories);
  useCategoriesStore.getState().setCategories(categories);
}

fetchCategories();

export default useCategoriesStore;
