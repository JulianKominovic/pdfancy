import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ButtonGroup, Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { ChevronDownIcon } from "lucide-react";

import useCategoriesStore from "@/stores/categories";
import sqliteCategory from "@/storage/sqlite/category";
import { PAPER_COLORS } from "@/constants";
import sqliteFile, { SqliteFile } from "@/storage/sqlite/files";
import vFilesCache from "@/storage/cache/files";

const Category = () => {
  const { id } = useParams();
  const categories = useCategoriesStore((s) => s.categories);
  const setCategories = useCategoriesStore((s) => s.setCategories);
  const category = categories.find((c) => c.id === Number(id));
  const updateOrAddCategory = useCategoriesStore((s) => s.updateOrAddCategory);
  const [files, setFiles] = useState<SqliteFile[]>([]);

  useEffect(() => {
    sqliteCategory.getAll().then(({ results }) => {
      setCategories(results as any);
    });
    sqliteFile.getAll().then(({ results }) => setFiles(results as any));
  }, []);
  if (!category) return null;
  if (category.color) {
    document.documentElement.style.setProperty(
      "--bg-color",
      `#${category.color}33`
    );
  }

  return (
    <div
      className="pt-8 min-h-screen"
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

        // Prevent default behavior (Prevent file from being opened)

        if (ev.dataTransfer.items) {
          // Use DataTransferItemList interface to access the file(s)
          [...ev.dataTransfer.items].forEach((item, i) => {
            // If dropped items aren't files, reject them
            if (item.kind === "file") {
              const file = item.getAsFile();

              if (file?.type.includes("pdf")) {
                console.log(`… file[${i}].name = ${file?.name}`);
                sqliteFile.updateOrAdd({ name: file.name }).then((r) => {
                  if (r) {
                    const id = r.results[0].id;
                    vFilesCache.addFile(file, id);
                  }
                });
              }
            }
          });
        } else {
          // Use DataTransfer interface to access the file(s)
          [...ev.dataTransfer.files].forEach((file, i) => {
            console.log(`… file[${i}].name = ${file.name}`);
            if (file?.type.includes("pdf")) {
              console.log(`… file[${i}].name = ${file?.name}`);
              sqliteFile.updateOrAdd({ name: file.name }).then((r) => {
                if (r) {
                  const id = r.results[0].id;
                  vFilesCache.addFile(file, id);
                }
              });
            }
          });
        }
      }}
    >
      <div className="flex items-center gap-4">
        <ButtonGroup>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button variant="shadow" isIconOnly>
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
          className="text-4xl mb-12 bg-transparent border-b-2 border-primary-50 font-serif"
          placeholder="Name"
          value={category.name}
          onChange={(e) => {
            const value = e.currentTarget.value;

            updateOrAddCategory({ ...category, name: value });
          }}
        />
      </div>
      <textarea
        className="text-xl bg-transparent w-full resize-none border-b-2 border-primary-50"
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
      <ul>
        {files.map((file) => (
          <Link to={"/read/" + file.id} key={file.id + "file" + file.name}>
            {file.name}
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default Category;
