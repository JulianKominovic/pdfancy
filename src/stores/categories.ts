import { create } from "zustand";

import sqliteCategory, { SqliteCategory } from "@/storage/sqlite/category";

type CategoriesStore = {
  categories: SqliteCategory[];
  setCategories: (categories: SqliteCategory[]) => void;
  updateOrAddCategory: (
    category: SqliteCategory
  ) => Promise<{} | SqliteCategory>;
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
}));

export default useCategoriesStore;
