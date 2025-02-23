import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import deepmerge from "deepmerge";

import vFilesCache from "@/storage/cache/files";
import loggers from "@/utils/loggers";
import { HighlightArea } from "@react-pdf-viewer/highlight";
const foldersDb = new Promise<IDBDatabase>((resolve, reject) => {
  const openRequest = indexedDB.open("folders", 1);

  openRequest.onupgradeneeded = (event) => {
    const db = openRequest.result;

    switch (event.oldVersion) {
      // Client don't have db installed
      case 0:
        db.createObjectStore("folders");
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
  id?: string;
  tracking: HighlightArea;
  text: string;
  reflections: any[];
  color: string;
};

// Custom storage object
export type FolderFile = {
  id?: string;
  name: string;
  date?: string;
  creator?: string;
  scrollPosition?: number;
  readPages: number;
  pages: number;
  highlights: Record<string, CategoryFileHighlight>;
};

export type Folder = {
  id: string;
  name: string;
  description: string;
  color: string;
  files: Record<string, FolderFile>;
};

type FoldersStore = {
  folders: Record<string, Folder>;
  attachFile: (
    file: File,
    folderFile: Omit<FolderFile, "id"> & { id?: string },
    folderId: string
  ) => Promise<void>;
  updateFile: (folderFile: Partial<FolderFile>, folderId: string) => void;
  addOrSetFolder: (folder: Omit<Folder, "id"> & { id?: string }) => Folder;
  addOrSetHighlight: (
    folderId: string,
    fileId: string,
    highlight: CategoryFileHighlight
  ) => void;
  deleteHighlight: (
    folderId: string,
    fileId: string,
    highlightId: string
  ) => void;
  destroy: () => void;
};

export const useFoldersStore = create(
  subscribeWithSelector<FoldersStore>((set, get) => ({
    folders: {},
    deleteHighlight(folderId, fileId, highlightId) {
      const old = get().folders[folderId].files[fileId].highlights;
      delete old[highlightId];
      set(
        deepmerge(get(), {
          folders: {
            [folderId]: {
              files: {
                [fileId]: {
                  highlights: old,
                },
              },
            },
          },
        })
      );
    },
    addOrSetHighlight(folderId, fileId, highlight) {
      let id = highlight.id;
      if (!highlight.id) {
        id = crypto.randomUUID();
      }
      const newHighlight = { ...highlight, id };
      set(
        deepmerge(get(), {
          folders: {
            [folderId]: {
              files: {
                [fileId]: {
                  highlights: {
                    [id as string]: newHighlight,
                  },
                },
              },
            },
          },
        })
      );
    },
    addOrSetFolder: (folder) => {
      let id = folder.id;
      if (!folder.id) {
        id = crypto.randomUUID();
      }
      const newFolder = { ...folder, id } as Folder;
      set(
        deepmerge(get(), {
          folders: {
            [id as string]: newFolder,
          },
        })
      );
      return newFolder as Folder;
    },
    destroy() {
      foldersDb.then((db) => {
        const transaction = db.transaction("folders", "readwrite");
        transaction.objectStore("folders").clear();
        set({ folders: {} });
      });
    },
    async attachFile(file, folderFile, folderId) {
      const id = crypto.randomUUID() as string;
      await vFilesCache.addFile(file, id);
      set(
        deepmerge(get(), {
          folders: {
            [folderId]: {
              files: {
                [id]: { ...folderFile, id },
              },
            },
          } as Record<string, Folder>,
        })
      );
    },
    updateFile(folderFile, folderId) {
      set(
        deepmerge(get(), {
          folders: {
            [folderId]: {
              files: {
                [folderFile.id as string]: folderFile as FolderFile,
              },
            },
          } as Record<string, Folder>,
        })
      );
    },
  }))
);
foldersDb.then((db) => {
  const transaction = db.transaction("folders", "readonly");
  const request = transaction.objectStore("folders").getAll();
  request.onsuccess = () => {
    loggers.layers.storage("Retrieved folders", request.result);
    useFoldersStore.setState({
      folders: Object.fromEntries(request.result.map((v) => [v.id, v])),
    });
  };
});

useFoldersStore.subscribe(
  (state) => state.folders,
  (folders) => {
    loggers.layers.storage("Saving folders", folders);
    foldersDb.then((db) => {
      const transaction = db.transaction("folders", "readwrite");
      for (const [id, folder] of Object.entries(folders)) {
        transaction.objectStore("folders").put(folder, id);
      }
    });
  }
);
