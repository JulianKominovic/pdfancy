import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import vFilesCache from "@/storage/cache/files";

const categoriesDb = new Promise<IDBDatabase>((resolve, reject) => {
  const openRequest = indexedDB.open("categories", 1);

  openRequest.onupgradeneeded = (event) => {
    const db = openRequest.result;

    switch (event.oldVersion) {
      // Client don't have db installed
      case 0:
        db.createObjectStore("categories", { keyPath: "id" });
        break;
      case 1:
        break;
      default:
        break;
    }
  };

  openRequest.onsuccess = () => {
    resolve(openRequest.result);
  };

  openRequest.onerror = (event) => {
    reject(event);
  };
});

// Custom storage object
export type CategoryFile = {
  id: string;
  name: string;
  date?: string;
  creator?: string;
  scrollPosition?: number;
  readPages: number;
  pages: number;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  color: string;
  files: CategoryFile[];
};

type CategoriesStore = {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  attachFile: (
    file: File,
    categoryFile: Omit<CategoryFile, "id"> & { id?: string },
    categoryId: string
  ) => Promise<void>;
  updateFile: (categoryFile: Partial<CategoryFile>, categoryId: string) => void;
  addOrSetCategory: (
    category: Omit<Category, "id"> & { id?: string }
  ) => Category;
  destroy: () => void;
};

export const useCategoriesStore = create(
  subscribeWithSelector<CategoriesStore>((set, get) => ({
    categories: [],
    addOrSetCategory: (category) => {
      if (category.id) {
        set({
          categories: get().categories.map((c) =>
            c.id === category.id
              ? {
                  ...c,
                  ...category,
                  files: [
                    ...new Set([...(c.files || []), ...(category.files || [])]),
                  ],
                }
              : c
          ),
        });
      } else {
        const uuid = crypto.randomUUID();
        set({
          categories: [
            ...get().categories,
            { ...category, id: uuid } as Category,
          ],
        });
      }
      return category as Category;
    },
    destroy() {
      categoriesDb.then((db) => {
        const transaction = db.transaction("categories", "readwrite");
        transaction.objectStore("categories").clear();
      });
      set({
        categories: [],
      });
    },
    setCategories: (categories: Category[]) => set({ categories }),
    async attachFile(file, categoryFile, categoryId) {
      const id = crypto.randomUUID();
      await vFilesCache.addFile(file, id);
      set({
        categories: get().categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                files: (c.files || []).concat({
                  ...categoryFile,
                  id,
                }),
              }
            : c
        ),
      });
    },
    updateFile(categoryFile, categoryId) {
      set({
        categories: get().categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                files: [categoryFile as any],
              }
            : c
        ),
      });
    },
  }))
);
categoriesDb.then((db) => {
  const transaction = db.transaction("categories", "readonly");
  const request = transaction.objectStore("categories").getAll();
  request.onsuccess = () => {
    useCategoriesStore.setState({ categories: request.result });
  };
});

useCategoriesStore.subscribe(
  (state) => state.categories,
  (categories) => {
    categoriesDb.then((db) => {
      const transaction = db.transaction("categories", "readwrite");
      for (const category of categories) {
        transaction.objectStore("categories").put(category);
      }
    });
  }
);
