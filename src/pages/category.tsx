import { useParams } from "react-router-dom";
import { ButtonGroup, Button } from "@heroui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";

import { useCategoriesStore } from "@/stores/categories";
import { PASTEL_COLORS } from "@/constants";
import CategoryFiles from "@/components/category-files";
import { applyCategoryColor } from "@/utils/customize";

const Category = () => {
  const { categoryId } = useParams();
  const categories = useCategoriesStore((s) => s.categories);
  const category = categories.find((c) => c.id === categoryId);
  const addOrSetCategory = useCategoriesStore((s) => s.addOrSetCategory);

  if (!category) return null;

  applyCategoryColor(category);

  return (
    <div className="min-h-screen pt-8">
      <div className="flex items-start gap-4">
        <ButtonGroup>
          <Popover placement="bottom">
            <PopoverTrigger>
              <div
                className="p-2 cursor-pointer rounded-xl"
                style={{
                  backgroundColor: category.color,
                }}
              >
                <div className="size-6 bg-black aspect-square rounded-[50%] shadow-medium" />
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
                    addOrSetCategory({
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

            addOrSetCategory({ ...category, name: value });
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
        value={category.description}
        onChange={(e) => {
          const value = e.currentTarget.value;

          addOrSetCategory({ ...category, description: value });
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
