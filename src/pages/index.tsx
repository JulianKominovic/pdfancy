import FolderFiles from "@/components/folder-files";
import { PASTEL_COLORS } from "@/constants";
import { useFoldersStore } from "@/stores/folders";
import { ButtonGroup, Button } from "@heroui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import Folder from "./folder";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Divider } from "@heroui/divider";
export default function IndexPage() {
  const folders = useFoldersStore((s) => s.folders);
  const addOrSetFolder = useFoldersStore((s) => s.addOrSetFolder);
  const navigate = useNavigate();
  const color = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
  return (
    <div className="py-8 md:py-10">
      <h1 className="mb-2 text-4xl font-bold">{"Let's get started"}</h1>
      <p className="mb-6 text-xl text-black/60">
        {"Start by creating a folder."}
      </p>
      {folders.length === 0 && (
        <Button
          size="lg"
          onPress={() => {
            const folder = addOrSetFolder({
              name: "New folder",
              color: `hsl(${color.h}, ${color.s}%, ${color.l}%)`,
              description: "Add a description here",
              files: [],
            });
            navigate(`/folder/${folder.id}`);
          }}
        >
          <Plus /> Create a folder
        </Button>
      )}
      <Divider className="my-12" />
      {folders.map((folder) => (
        <div key={folder.id} className="mb-4">
          <div className="flex items-start gap-4">
            <ButtonGroup>
              <Popover placement="bottom">
                <PopoverTrigger>
                  <div
                    className="p-2 cursor-pointer rounded-xl shadow-large"
                    style={{
                      backgroundColor: folder.color,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: folder.color,
                      }}
                      className="size-6 aspect-square saturate-200 rounded-[50%] shadow-small"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  aria-label="Color"
                  className="flex flex-wrap h-56 gap-2 overflow-x-hidden overflow-y-auto w-72"
                >
                  {PASTEL_COLORS.map(({ h, s, l }) => (
                    <Button
                      key={`hsl(${h}, ${s}%, ${l}%)`}
                      onPress={() => {
                        addOrSetFolder({
                          ...folder,
                          color: `hsl(${h}, ${s}%, ${l}%)`,
                        });
                      }}
                      className="p-0 !size-10 overflow-hidden flex-shrink-0 min-w-0 aspect-square !rounded-[50%]"
                      style={{
                        backgroundColor: `hsl(${h}, ${s}%, ${l}%)`,
                      }}
                    />
                  ))}
                </PopoverContent>
              </Popover>
            </ButtonGroup>
            <input
              className="w-full mb-6 font-serif text-4xl bg-transparent border-none focus:outline-none"
              placeholder="Name"
              value={folder.name}
              onChange={(e) => {
                const value = e.currentTarget.value;

                addOrSetFolder({ ...folder, name: value });
              }}
            />
          </div>
          <textarea
            className="w-full mb-4 text-xl bg-transparent border-none resize-none text-black/50 focus:outline-none"
            placeholder="Description"
            style={
              {
                fieldSizing: "content",
              } as any
            }
            value={folder.description}
            onChange={(e) => {
              const value = e.currentTarget.value;

              addOrSetFolder({ ...folder, description: value });
            }}
          />
          <FolderFiles folder={folder} />
        </div>
      ))}
    </div>
  );
}
