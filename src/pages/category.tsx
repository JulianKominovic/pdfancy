import { Link, useParams } from "react-router-dom";
import { ButtonGroup, Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { getDocument } from "pdfjs-dist";
import { Card, CardFooter, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";

import useCategoriesStore from "@/stores/categories";
import { PAPER_COLORS } from "@/constants";

const Category = () => {
  const { id } = useParams();
  const categories = useCategoriesStore((s) => s.categories);
  const category = categories.find((c) => c.id === Number(id));
  const updateOrAddCategory = useCategoriesStore((s) => s.updateOrAddCategory);
  const addFileToCategory = useCategoriesStore((s) => s.addFileToCategory);

  if (!category) return null;
  if (category.color) {
    document.documentElement.style.setProperty(
      "--bg-color",
      `#${category.color}33`
    );
  }

  // Prevent default behavior (Prevent file from being opened)
  async function saveFile(file: File | null) {
    if (file?.type.includes("pdf") && category?.id) {
      const pdfProxy = await getDocument(await file.arrayBuffer()).promise;
      const pages = pdfProxy.numPages;
      const fileMetadata = await pdfProxy.getMetadata();
      const metadata = fileMetadata.metadata?.getAll();

      addFileToCategory(
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
          progressPercent: 0,
          readSeconds: 0,
          readPages: 0,
          pages: pages,
        },
        file,
        category.id
      );
    }
  }
  return (
    <div
      className="min-h-screen pt-8"
      onDragEnd={(ev) => {
        console.log("File(s) dropped");
        ev.currentTarget.style.backgroundColor = "transparent";
      }}
      onDragOver={(ev) => {
        ev.preventDefault();
        ev.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
      }}
      onDrop={(ev) => {
        ev.preventDefault();
        console.log("File(s) dropped");

        ev.currentTarget.style.backgroundColor = "transparent";

        if (ev.dataTransfer.items) {
          [...ev.dataTransfer.items].forEach((item, i) => {
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
      <div className="flex items-start gap-4">
        <ButtonGroup>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button isIconOnly variant="shadow">
                <div
                  className="size-6 aspect-square rounded-[50%]"
                  style={{
                    backgroundColor: `#${category.color}`,
                  }}
                />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Color"
              className="max-w-[300px] flex flex-wrap gap-2"
              selectedKeys={[category.color]}
              selectionMode="single"
              onSelectionChange={(selectedKeys) => {
                updateOrAddCategory({
                  ...category,
                  color: selectedKeys.currentKey as string,
                });
              }}
            >
              {PAPER_COLORS.map(({ color, name }) => (
                <DropdownItem
                  key={color}
                  className="flex items-center"
                  color="secondary"
                  value={color}
                >
                  <div
                    className="size-6 aspect-square rounded-[50%]"
                    style={{
                      backgroundColor: `#${color}`,
                    }}
                  />
                  {name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </ButtonGroup>
        <input
          className="w-full mb-6 font-serif text-4xl bg-transparent border-none focus:outline-none"
          placeholder="Name"
          value={category.name}
          onChange={(e) => {
            const value = e.currentTarget.value;

            updateOrAddCategory({ ...category, name: value });
          }}
        />
      </div>
      <textarea
        className="w-full mb-12 text-xl bg-transparent border-none resize-none focus:outline-none"
        placeholder="Description"
        style={
          {
            "field-sizing": "content",
          } as any
        }
        value={category.description}
        onChange={(e) => {
          const value = e.currentTarget.value;

          updateOrAddCategory({ ...category, description: value });
        }}
      />
      <section className="flex flex-wrap gap-4">
        {category.files.map((file) => (
          <Card
            isFooterBlurred
            as={Link}
            key={file.id + "file" + file.name}
            to={"/read/" + file.id}
            isPressable
            isHoverable
            shadow="sm"
            className="min-w-0 p-0 aspect-square size-64"
          >
            <CardHeader className="absolute z-10 flex-col items-start top-1">
              <p className="font-bold uppercase text-tiny text-black/60">
                {file.progressPercent}% • read {file.readPages} of {file.pages}{" "}
                pages
              </p>
              <h4 className="text-2xl font-medium text-black">{file.name}</h4>
            </CardHeader>
            <Image
              removeWrapper
              alt="Card example background"
              className="z-0 object-cover w-full h-full scale-125 -translate-y-6"
              src="https://heroui.com/images/card-example-6.jpeg"
            />
            <CardFooter className="absolute bottom-0 z-10 justify-between bg-primary-100 border-t-1 border-zinc-100/50">
              {file.creator}
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
};

export default Category;
