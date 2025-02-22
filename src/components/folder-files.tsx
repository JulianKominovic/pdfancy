import { Card, CardHeader, CardFooter } from "@heroui/card";
import { Plus } from "lucide-react";
import { getDocument } from "pdfjs-dist";
import { Link } from "react-router-dom";

import { Folder, useFoldersStore } from "@/stores/folders";

const FolderFiles = ({ folder }: { folder: Folder }) => {
  const addFileToFolder = useFoldersStore((s) => s.attachFile);
  // Prevent default behavior (Prevent file from being opened)
  async function saveFile(file: File | null) {
    if (file?.type.includes("pdf") && folder.id) {
      const pdfProxy = await getDocument(await file.arrayBuffer()).promise;
      const pages = pdfProxy.numPages;
      const fileMetadata = await pdfProxy.getMetadata();
      const metadata = fileMetadata.metadata?.getAll();

      addFileToFolder(
        file,
        {
          name:
            (fileMetadata.info as any)?.["Title"] ||
            metadata?.["Title"] ||
            metadata?.["dc:title"] ||
            file.name,
          creator:
            (fileMetadata.info as any)?.["Author"] ||
            metadata?.["Author"] ||
            metadata?.["Creator"] ||
            "",
          date:
            metadata?.["CreationDate"] ||
            (fileMetadata.info as any)?.["CreationDate"] ||
            "",
          scrollPosition: 0,
          readPages: 0,
          pages: pages,
          highlights: {},
        },
        folder.id
      );
    }
  }
  return (
    <section className="flex flex-wrap gap-4 overflow-visible">
      {Object.values(folder.files).map((file) => (
        <Card
          isFooterBlurred
          as={Link}
          key={file.id + folder.id + "file"}
          to={"/folder/" + folder.id + "/" + file.id}
          isPressable
          isHoverable
          shadow="md"
          className="min-w-0 p-0 aspect-square size-64 bg-primary-100 group"
        >
          <CardHeader className="absolute z-10 flex-col items-start top-1">
            <p className="font-bold uppercase text-tiny text-black/60">
              {Math.round((file.readPages / file.pages) * 100)} % • read{" "}
              {file.readPages} of {file.pages} pages
            </p>
            <h4 className="text-2xl font-medium text-black">{file.name}</h4>
          </CardHeader>

          <CardFooter className="absolute bottom-0 z-10 justify-between bg-primary-100  group-data-[hover]:bg-content2 duration-300">
            {file.creator}
          </CardFooter>
        </Card>
      ))}
      <Card
        as={"label"}
        isPressable
        isHoverable
        shadow="md"
        className="items-center justify-center min-w-0 p-4 text-center cursor-pointer text-black/60 aspect-square size-64 bg-primary-100"
        htmlFor="file-input"
        onDragEnd={(ev) => {
          ev.currentTarget.style.backgroundColor = "transparent";
        }}
        onDragOver={(ev) => {
          ev.preventDefault();
          ev.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
        }}
        onDrop={(ev) => {
          ev.preventDefault();

          ev.currentTarget.style.backgroundColor = "transparent";

          if (ev.dataTransfer.items) {
            [...ev.dataTransfer.items].forEach((item) => {
              if (item.kind === "file") {
                const file = item.getAsFile();
                saveFile(file);
              }
            });
          } else {
            [...ev.dataTransfer.files].forEach(saveFile);
          }
        }}
      >
        <Plus size={48} />
        <p className="text-sm text-black">Click to add file or drag and drop</p>
        <small className="text-xs text-black/60">
          (Only PDF files are supported)
        </small>
        <input
          id="file-input"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) {
              saveFile(file);
            }
          }}
        />
      </Card>
    </section>
  );
};

export default FolderFiles;
