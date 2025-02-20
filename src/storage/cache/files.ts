const cacheKey = "vfiles";

const vFilesCache = {
  addFile: (file: File, fileName: string) => {
    const url = new URL(`/pdfancy-vfiles/${fileName}`, window.location.href);

    return window.caches
      .open(cacheKey)
      .then((cache) => cache.put(url, new Response(file)));
  },
  getFile: (fileName: string) => {
    const url = new URL(`/pdfancy-vfiles/${fileName}`, window.location.href);

    return window.caches.open(cacheKey).then((cache) => cache.match(url));
  },
  deleteFile: (fileName: string) => {
    const url = new URL(`/pdfancy-vfiles/${fileName}`, window.location.href);
    return window.caches.open(cacheKey).then((cache) => cache.delete(url));
  },
  async deleteAllFiles() {
    const cache = await window.caches.open(cacheKey);
    const keys = await cache.keys();
    await Promise.all(keys.map((key) => cache.delete(key)));
  },
};

export default vFilesCache;
