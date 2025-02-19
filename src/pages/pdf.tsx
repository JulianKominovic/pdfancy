import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PdfViewer from "@/components/pdf-viewer";
import vFilesCache from "@/storage/cache/files";
import { Skeleton } from "@heroui/skeleton";

const PdfPage = () => {
  const { fileName } = useParams();
  const [file, setFile] = useState<File | undefined>();

  useEffect(() => {
    if (fileName)
      vFilesCache.getFile(fileName).then((response) => {
        if (response) {
          response.blob().then((blob) => {
            const file = new File([blob], `${fileName}.pdf`, {
              type: "application/pdf",
            });
            setFile(file);
          });
        }
      });
  }, []);
  if (!file || !fileName)
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-8">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    );
  return <PdfViewer file={file} fileId={fileName} />;
};

export default PdfPage;
