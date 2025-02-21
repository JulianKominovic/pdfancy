import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import vFilesCache from "@/storage/cache/files";

const foldersDb = new Promise<IDBDatabase>((resolve, reject) => {
  const openRequest = indexedDB.open("folders", 1);

  openRequest.onupgradeneeded = (event) => {
    const db = openRequest.result;

    switch (event.oldVersion) {
      // Client don't have db installed
      case 0:
        db.createObjectStore("folders", { keyPath: "id" });
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
export type CategoryFileHighlight = {
  start: {
    selector: string;
    offset: number;
  };
  end: {
    selector: string;
    offset: number;
  };
  reflections: any[];
  color: string;
};

// Custom storage object
export type FolderFile = {
  id: string;
  name: string;
  date?: string;
  creator?: string;
  scrollPosition?: number;
  readPages: number;
  pages: number;
  highlights: CategoryFileHighlight[];
};

export type Folder = {
  id: string;
  name: string;
  description: string;
  color: string;
  files: FolderFile[];
};

type FoldersStore = {
  folders: Folder[];
  setFolders: (folders: Folder[]) => void;
  attachFile: (
    file: File,
    folderFile: Omit<FolderFile, "id"> & { id?: string },
    folderId: string
  ) => Promise<void>;
  updateFile: (folderFile: Partial<FolderFile>, folderId: string) => void;
  addOrSetFolder: (folder: Omit<Folder, "id"> & { id?: string }) => Folder;
  destroy: () => void;
};

export const useFoldersStore = create(
  subscribeWithSelector<FoldersStore>((set, get) => ({
    folders: [],
    addOrSetFolder: (folder) => {
      if (folder.id) {
        set({
          folders: get().folders.map((f) =>
            f.id === folder.id
              ? {
                  ...f,
                  ...folder,
                  files: [
                    ...new Set([...(f.files || []), ...(folder.files || [])]),
                  ],
                }
              : f
          ),
        });
      } else {
        const uuid = crypto.randomUUID();
        const newFolder = { ...folder, id: uuid } as Folder;
        set({
          folders: [...get().folders, newFolder],
        });
        return newFolder;
      }
      return folder as Folder;
    },
    destroy() {
      foldersDb.then((db) => {
        const transaction = db.transaction("folders", "readwrite");
        transaction.objectStore("folders").clear();
      });
      set({
        folders: [],
      });
    },
    setFolders: (folders: Folder[]) => set({ folders }),
    async attachFile(file, folderFile, folderId) {
      const id = crypto.randomUUID();
      await vFilesCache.addFile(file, id);
      set({
        folders: get().folders.map((f) =>
          f.id === folderId
            ? {
                ...f,
                files: (f.files || []).concat({
                  ...folderFile,
                  id,
                }),
              }
            : f
        ),
      });
    },
    updateFile(folderFile, folderId) {
      set({
        folders: get().folders.map((f) =>
          f.id === folderId
            ? {
                ...f,
                files: [folderFile as any],
              }
            : f
        ),
      });
    },
  }))
);
foldersDb.then((db) => {
  const transaction = db.transaction("folders", "readonly");
  const request = transaction.objectStore("folders").getAll();
  request.onsuccess = () => {
    useFoldersStore.setState({ folders: request.result });
  };
});

useFoldersStore.subscribe(
  (state) => state.folders,
  (folders) => {
    foldersDb.then((db) => {
      const transaction = db.transaction("folders", "readwrite");
      for (const folder of folders) {
        transaction.objectStore("folders").put(folder);
      }
    });
  }
);
