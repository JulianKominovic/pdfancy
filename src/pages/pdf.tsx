import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PdfViewer from "@/components/pdf-viewer";
import vFilesCache from "@/storage/cache/files";

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
  if (!file) return <p>Loading...</p>;

  return <PdfViewer file={file} />;
};

export default PdfPage;
