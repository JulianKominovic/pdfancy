import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Skeleton } from "@heroui/skeleton";

import PdfViewer from "@/components/pdf";
import vFilesCache from "@/storage/cache/files";
import { useCategoriesStore } from "@/stores/categories";
import { applyCategoryColor } from "@/utils/customize";

const PdfPage = () => {
  const { categoryId, fileId } = useParams();
  const [file, setFile] = useState<File | undefined>();
  const category = useCategoriesStore((s) =>
    s.categories.find((c) => c.id === categoryId)
  );
  const categoryFile = category?.files.find((f) => f.id === fileId);

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
  if (!file || !categoryFile || !categoryId || !category)
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-8">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    );
  applyCategoryColor(category);
  return (
    <PdfViewer
      file={file}
      categoryFile={categoryFile}
      categoryId={categoryId}
    />
  );
};

export default PdfPage;
