import { create } from "zustand";

type DrawersStore = {
  showNewCategoryDrawer: boolean;
  setShowNewCategoryDrawer: (show: boolean) => void;
};

const useDrawersStore = create<DrawersStore>((set) => ({
  showNewCategoryDrawer: false,
  setShowNewCategoryDrawer: (show) => set({ showNewCategoryDrawer: show }),
}));

export default useDrawersStore;
