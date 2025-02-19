import { Link, useParams } from "react-router-dom";
import { ButtonGroup, Button } from "@heroui/button";
import { getDocument } from "pdfjs-dist";
import { Card, CardFooter, CardHeader } from "@heroui/card";
import { Image } from "@heroui/image";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Plus } from "lucide-react";

import useCategoriesStore from "@/stores/categories";
import { PASTEL_COLORS } from "@/constants";
import {
  stringToHsl,
  stripHslString,
  colorPalleteFromHslPastelColor,
} from "@/utils/color";
import CategoryFiles from "@/components/category-files";

const Category = () => {
  const { id } = useParams();
  const categories = useCategoriesStore((s) => s.categories);
  const category = categories.find((c) => c.id === Number(id));
  const updateOrAddCategory = useCategoriesStore((s) => s.updateOrAddCategory);
  const addFileToCategory = useCategoriesStore((s) => s.addFileToCategory);

  if (!category) return null;
  if (category.color) {
    const pallete = colorPalleteFromHslPastelColor(stringToHsl(category.color));
    document.documentElement.style.setProperty("--bg-color", category.color);

    document.documentElement.style.setProperty(
      "--heroui-content2",
      stripHslString(pallete[200])
    );
    document.documentElement.style.setProperty(
      "--heroui-content3",
      stripHslString(pallete[400])
    );

    document.documentElement.style.setProperty(
      "--heroui-primary",
      stripHslString(category.color)
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-50",
      stripHslString(pallete[50])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-100",
      stripHslString(pallete[100])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-200",
      stripHslString(pallete[200])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-300",
      stripHslString(pallete[300])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-400",
      stripHslString(pallete[400])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-500",
      stripHslString(pallete[500])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-600",
      stripHslString(pallete[600])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-700",
      stripHslString(pallete[700])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-800",
      stripHslString(pallete[800])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-900",
      stripHslString(pallete[900])
    );
    document.documentElement.style.setProperty(
      "--heroui-primary-950",
      stripHslString(pallete[950])
    );
  }

  return (
    <div className="min-h-screen pt-8">
      <div className="flex items-start gap-4">
        <ButtonGroup>
          <Popover placement="bottom">
            <PopoverTrigger isIconOnly variant="shadow">
              <Button color="secondary">
                <div
                  className="size-6 aspect-square rounded-[50%]"
                  style={{
                    backgroundColor: category.color,
                  }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              aria-label="Color"
              className="flex flex-wrap h-56 gap-2 overflow-x-hidden overflow-y-auto w-72"
            >
              {PASTEL_COLORS.map(({ h, s, l }) => (
                <Button
                  key={`hsl(${h}, ${s}%, ${l}%)`}
                  onPress={() => {
                    updateOrAddCategory({
                      ...category,
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
          value={category.name}
          onChange={(e) => {
            const value = e.currentTarget.value;

            updateOrAddCategory({ ...category, name: value });
          }}
        />
      </div>
      <textarea
        className="w-full mb-12 text-xl bg-transparent border-none resize-none text-black/50 focus:outline-none"
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
      <h2 className="mb-4 text-2xl font-medium text-black/60">
        Files ({category.files.length})
      </h2>
      <CategoryFiles category={category} />
    </div>
  );
};

export default Category;
