import * as z from "zod";

// import { z } from "zod";

const NodeBase = z.object({
  id: z.string(),
  // get children(): z.ZodOptional<z.ZodArray<typeof Node>> {
  //   return z.array(Node).optional();
  // },
});

// typed as any
const NodeOne = z.object({
  ...NodeBase.shape,
  name: z.literal("nodeOne"),
  // if this is commented out, NodeTwo becomes any
  get children(): z.ZodArray<z.ZodUnion<[typeof NodeOne, typeof NodeTwo]>> {
    return z.array(z.union([NodeOne, NodeTwo]));
  },
});

// also typed as any
// const NodeOne = z.object({
//     ...NodeBase.shape,
//     name: z.literal("nodeOne"),
//     get children() { return z.array(Node) },
// });

// oddly, this is typed correctly
const NodeTwo = z.object({
  ...NodeBase.shape,
  name: z.literal("nodeTwo"),
  get children(): z.ZodArray<z.ZodUnion<[typeof NodeOne, typeof NodeTwo]>> {
    return z.array(z.union([NodeOne, NodeTwo]));
  },
});

// const Node: z.ZodUnion<[typeof NodeOne, typeof NodeTwo]> = z.union([NodeOne, NodeTwo]);
