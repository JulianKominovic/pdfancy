import { Button } from "@heroui/button";
import { NavLink as RouterLink, useNavigate } from "react-router-dom";
import { PlusCircle, Trash } from "lucide-react";
import clsx from "clsx";
import { Chip } from "@heroui/chip";

import { PASTEL_COLORS } from "@/constants";
import vFilesCache from "@/storage/cache/files";
import { stringToHsl } from "@/utils/color";
import { useFoldersStore } from "@/stores/folders";

export const Navbar = () => {
  const classNameFn = ({ isActive }: any) =>
    clsx(isActive ? "opacity-100" : "opacity-50", "flex items-center gap-1");
  const folders = useFoldersStore((s) => s.folders);
  const addOrSetFolder = useFoldersStore((s) => s.addOrSetFolder);
  const destroy = useFoldersStore((s) => s.destroy);
  const color = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
  const navigate = useNavigate();

  return (
    <nav className="flex-shrink-0 w-64 h-full px-4 py-8">
      <ul className="flex flex-col">
        <li className="mb-2">
          <RouterLink className={classNameFn} to="/">
            Home
          </RouterLink>
        </li>
        {folders.map((folder, i) => {
          return (
            <li key={folder.id + folder.name + "nav" + i} className="mb-2">
              <RouterLink className={classNameFn} to={`/folder/${folder.id}`}>
                <div
                  className="shadow-md size-3 border saturate-[3] border-black/10 aspect-square rounded-[50%]"
                  style={{
                    backgroundColor: folder.color,
                  }}
                />
                {folder.name || "No name"}{" "}
                <Chip color="primary" variant="flat" size="sm">
                  {folder.files.length}
                </Chip>
              </RouterLink>
            </li>
          );
        })}
        <li>
          <Button
            className="mb-2 text-primary-700"
            size="md"
            variant="light"
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
            <PlusCircle size={16} /> New folder
          </Button>
        </li>
      </ul>
      <Button
        size="sm"
        className="mt-auto"
        color="danger"
        variant="shadow"
        onPress={() => {
          destroy();
          vFilesCache.deleteAllFiles();
        }}
      >
        <Trash size={16} /> delete database
      </Button>
    </nav>
  );
};
