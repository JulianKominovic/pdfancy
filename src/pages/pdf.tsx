import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Skeleton } from "@heroui/skeleton";

import PdfViewer from "@/components/pdf";
import vFilesCache from "@/storage/cache/files";
import { useFoldersStore } from "@/stores/folders";
import { applyFolderColor } from "@/utils/customize";

const PdfPage = () => {
  const { folderId, fileId } = useParams();
  const [file, setFile] = useState<Uint8Array<ArrayBufferLike> | undefined>();
  const folder = useFoldersStore((s) => s.folders[folderId as string]);
  const folderFile = folder?.files[fileId as string];

  useEffect(() => {
    if (fileId)
      vFilesCache.getFile(fileId).then((response) => {
        if (response) {
          response.arrayBuffer().then((arrayBuffer) => {
            setFile(new Uint8Array(arrayBuffer));
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
