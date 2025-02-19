import useCategoriesStore from "@/stores/categories";
import CategoryFiles from "@/components/category-files";
export default function IndexPage() {
  const categories = useCategoriesStore((s) => s.categories);
  return (
    <div className="py-8 md:py-10">
      {categories.length === 0 && (
        <>
          <h1 className="text-4xl font-bold">Home</h1>
          <p className="text-sm text-black/60">
            No categories found. Please create a category to get started.
          </p>
          <hr className="my-8" />
        </>
      )}
      <h2 className="mb-4 text-4xl font-bold">Categories</h2>
      {categories.map((category) => (
        <div key={category.id} className="flex flex-col mb-16">
          <h2 className="text-xl font-bold">{category.name}</h2>
          <p className="mb-4 text-sm text-black/60">{category.description}</p>
          <CategoryFiles category={category} />
        </div>
      ))}
    </div>
  );
}
