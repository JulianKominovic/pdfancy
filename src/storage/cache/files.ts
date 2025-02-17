const vFilesCache = {
  addFile: (file: File, fileName: string) => {
    const url = new URL(
      `/pdfancy-vfiles/${fileName}.pdf`,
      window.location.href
    );

    return window.caches
      .open("vfiles")
      .then((cache) => cache.put(url, new Response(file)));
  },
  getFile: (fileName: string) => {
    const url = new URL(
      `/pdfancy-vfiles/${fileName}.pdf`,
      window.location.href
    );

    return window.caches.open("vfiles").then((cache) => cache.match(url));
  },
  deleteFile: (fileName: string) => {
    const url = new URL(
      `/pdfancy-vfiles/${fileName}.pdf`,
      window.location.href
    );
    return window.caches.open("vfiles").then((cache) => cache.delete(url));
  },
};

export default vFilesCache;
