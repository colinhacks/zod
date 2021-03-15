import { z } from ".";

const run = async () => {
  interface Category {
    name: string;
    subcategories: Category[];
  }

  const Category: z.Schema<Category> = z.late.object(() => ({
    name: z.string(),
    subcategories: z.array(Category),
  }));

  const untypedCategory: Category = {
    name: "I",
    subcategories: [
      {
        name: "A",
        subcategories: [
          {
            name: "1",
            subcategories: [
              {
                name: "a",
                subcategories: [],
              },
            ],
          },
        ],
      },
    ],
  };
  // creating a cycle
  // untypedCategory.subcategories = [untypedCategory];
  console.log(Category.parse(untypedCategory));
};

run();

export {};
