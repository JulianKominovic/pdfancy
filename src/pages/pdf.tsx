import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Skeleton } from "@heroui/skeleton";

import PdfViewer from "@/components/pdf-viewer";
import vFilesCache from "@/storage/cache/files";
import { useFoldersStore } from "@/stores/folders";
import { applyFolderColor } from "@/utils/customize";

const PdfPage = () => {
  const { folderId, fileId } = useParams();
  const [file, setFile] = useState<File | undefined>();
  const folder = useFoldersStore((s) =>
    s.folders.find((f) => f.id === folderId)
  );
  const folderFile = folder?.files.find((f) => f.id === fileId);

  useEffect(() => {
    if (fileId)
      vFilesCache.getFile(fileId).then((response) => {
        if (response) {
          response.blob().then((blob) => {
            const file = new File([blob], fileId, {
              type: "application/pdf",
            });
            setFile(file);
          });
        }
      });
  }, []);
  if (!file || !folderFile || !folderId || !folder)
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-8">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    );
  applyFolderColor(folder);
  return <PdfViewer file={file} folderFile={folderFile} folderId={folderId} />;
};

export default PdfPage;
