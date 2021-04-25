import { z } from "./index";

const run = async () => {
  const geojsonPolygonSchema = z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  });

  const geojsonMultiPolygonSchema = z.object({
    type: z.literal("MultiPolygon"),
  });

  const geojsonShapeSchema = z.union([
    geojsonPolygonSchema,
    geojsonMultiPolygonSchema,
  ]);

  const value = {
    type: "MultiPolygon",
    coordinates: [
      [
        [
          [0, 1],
          [2, 3],
          [4, 5],
        ],
      ],
    ],
  };
  console.log(geojsonShapeSchema.safeParse(value));
};

run();

export {};
