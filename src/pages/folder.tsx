import { useParams } from "react-router-dom";
import { ButtonGroup, Button } from "@heroui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";

import { useFoldersStore } from "@/stores/folders";
import { PASTEL_COLORS } from "@/constants";
import FolderFiles from "@/components/folder-files";
import { applyFolderColor } from "@/utils/customize";

const Folder = ({ externalFolderId }: { externalFolderId?: string }) => {
  const { folderId } = useParams();
  const _folders = useFoldersStore((s) => s.folders);
  const folders = Object.values(_folders);
  const folder = folders.find(
    (f) => f.id === folderId || f.id === externalFolderId
  );
  const addOrSetFolder = useFoldersStore((s) => s.addOrSetFolder);

  if (!folder) return null;

  applyFolderColor(folder);

  return (
    <div className="min-h-screen pt-8">
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
                  className="size-6 aspect-square saturate-[3] rounded-[50%] shadow-small"
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
        className="w-full mb-12 text-xl bg-transparent border-none resize-none text-black/50 focus:outline-none"
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
      <h2 className="mb-4 text-2xl font-medium text-black/60">
        Files ({Object.keys(folder.files).length})
      </h2>
      <FolderFiles folder={folder} />
    </div>
  );
};

export default Folder;
