import { create } from "zustand";

import sqliteFile, { SqliteFile } from "@/storage/sqlite/files";

type FilesStore = {
  files: SqliteFile[];
  setFiles: (files: SqliteFile[]) => void;
  updateOrAddFile: (file: SqliteFile) => Promise<{} | SqliteFile>;
};

const useFilesStore = create<FilesStore>((set, get) => ({
  files: [],
  setFiles: (files) => set({ files }),
  async updateOrAddFile(file) {
    const response = await sqliteFile.updateOrAdd(file);

    if (!response) return {};
    const updatedFile = response.results[0];

    if (!updatedFile) return {};
    let oldFiles = get().files;

    if (oldFiles.find((f) => f.id === updatedFile.id)) {
      set({
        files: oldFiles.map((f) =>
          f.id === updatedFile.id
            ? {
                ...f,
                ...updatedFile,
              }
            : f
        ),
      });
    } else {
      set({
        files: [...oldFiles, { ...updatedFile }],
      });
    }

    return updatedFile;
  },
  async linkFileToCategory(fileId: number, categoryId: number) {
    return sqliteFile.linkFileToCategory(fileId, categoryId);
  },
}));

sqliteFile.getAll().then((files) => {
  useFilesStore.getState().setFiles(files.results);
});

export default useFilesStore;
