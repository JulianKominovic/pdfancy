import { Button } from "@heroui/button";
import { NavLink as RouterLink } from "react-router-dom";
import { PlusCircle, Trash } from "lucide-react";
import clsx from "clsx";
import { Chip } from "@heroui/chip";

import sqlite from "@/storage/sqlite";
import useCategoriesStore from "@/stores/categories";
import { PAPER_COLORS } from "@/constants";
import vFilesCache from "@/storage/cache/files";
export const Navbar = () => {
  const classNameFn = ({ isActive }: any) =>
    clsx(isActive ? "opacity-100" : "opacity-50", "flex items-center gap-1");
  const categories = useCategoriesStore((s) => s.categories);
  const updateOrAddCategory = useCategoriesStore((s) => s.updateOrAddCategory);

  return (
    <nav className="flex-shrink-0 w-64 h-full px-4 py-8">
      <ul className="flex flex-col">
        <li className="mb-2">
          <RouterLink className={classNameFn} to="/">
            Recent
          </RouterLink>
        </li>
        {categories.map((category, i) => (
          <li key={category.id + category.name + "nav" + i} className="mb-2">
            <RouterLink className={classNameFn} to={`/category/${category.id}`}>
              <div
                className="bg-transparent size-3 border border-primary-300 aspect-square rounded-[50%]"
                style={{
                  backgroundColor: `#${category.color}`,
                  borderColor: `#${category.color}88`,
                }}
              />
              {category.name || "No name"}{" "}
              <Chip color="primary" variant="flat" size="sm">
                {category.fileCount ?? 0}
              </Chip>
            </RouterLink>
          </li>
        ))}
        <li>
          <Button
            className="mb-2"
            size="md"
            color="primary"
            onPress={() => {
              updateOrAddCategory({
                name: "New category",
                color:
                  PAPER_COLORS[Math.floor(Math.random() * PAPER_COLORS.length)]
                    .color,
                description: "Add a description here",
                files: [],
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
