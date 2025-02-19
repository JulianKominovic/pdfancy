import { Button } from "@heroui/button";
import { NavLink as RouterLink, useNavigate } from "react-router-dom";
import { PlusCircle, Trash } from "lucide-react";
import clsx from "clsx";
import { Chip } from "@heroui/chip";

import sqlite from "@/storage/sqlite";
import useCategoriesStore from "@/stores/categories";
import { PASTEL_COLORS } from "@/constants";
import vFilesCache from "@/storage/cache/files";
import { stringToHsl } from "@/utils/color";
export const Navbar = () => {
  const classNameFn = ({ isActive }: any) =>
    clsx(isActive ? "opacity-100" : "opacity-50", "flex items-center gap-1");
  const categories = useCategoriesStore((s) => s.categories);
  const updateOrAddCategory = useCategoriesStore((s) => s.updateOrAddCategory);
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
        {categories.map((category, i) => {
          const { h, s } = stringToHsl(category.color);
          return (
            <li key={category.id + category.name + "nav" + i} className="mb-2">
              <RouterLink
                className={classNameFn}
                to={`/category/${category.id}`}
              >
                <div
                  className="bg-transparent shadow-md size-3 border border-black/10 aspect-square rounded-[50%]"
                  style={{
                    backgroundColor: `hsl(${h + 10}, ${s}%, 50%)`,
                  }}
                />
                {category.name || "No name"}{" "}
                <Chip color="primary" variant="flat" size="sm">
                  {category.fileCount ?? 0}
                </Chip>
              </RouterLink>
            </li>
          );
        })}
        <li>
          <Button
            className="mb-2 shadow-lg text-primary-700 bg-primary-300"
            size="md"
            color="primary"
            onPress={() => {
              updateOrAddCategory({
                name: "New category",
                color: `hsl(${color.h}, ${color.s}%, ${color.l}%)`,
                description: "Add a description here",
                files: [],
              }).then((category) => {
                if ((category as any)?.id)
                  navigate(`/category/${(category as any).id}`);
              });
            }}
          >
            <PlusCircle size={16} /> category
          </Button>
        </li>
      </ul>
      <Button
        size="sm"
        className="mt-auto"
        color="danger"
        variant="shadow"
        onPress={() => {
          sqlite
            .run("SELECT name FROM sqlite_master WHERE type='table';")
            .then(({ results }) => {
              results.forEach(({ name }) => {
                sqlite.run(`DROP TABLE ${name};`);
              });
            });
          vFilesCache.deleteAllFiles();
        }}
      >
        <Trash size={16} /> delete database
      </Button>
    </nav>
  );
};
