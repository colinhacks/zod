import * as z from "zod";

const NodeBase = z.object({
  id: z.string(),
  get children() {
    return z.array(Node).optional();
  },
});

// typed as any
const NodeOne = NodeBase.extend({
  name: z.literal("nodeOne"),
  // if this is commented out, NodeTwo becomes any
  get children() {
    return z.array(Node);
  },
});

// also typed as any
// const NodeOne = z.object({
//     ...NodeBase.shape,
//     name: z.literal("nodeOne"),
//     get children() { return z.array(Node) },
// });

// oddly, this is typed correctly
const NodeTwo = NodeBase.extend({
  name: z.literal("nodeTwo"),
  get children() {
    return z.array(Node);
  },
});

const Node = z.union([NodeOne, NodeTwo]);
// // Define the base schemas first without children
// const NodeBase = z.object({
//   id: z.string(),
//   get children() {
//     return z.array(Node).optional();
//   },
// });

// const NodeOne = NodeBase.extend({
//   name: z.literal("nodeOne"),
//   get children(): z.ZodArray<typeof Node> {
//     return z.array(Node);
//   },
// });

// const NodeTwo = NodeBase.extend({
//   name: z.literal("nodeTwo"),
//   get children(): z.ZodArray<typeof Node> {
//     return z.array(Node);
//   },
// });

// // Define the union
// const Node = z.union([NodeOne, NodeTwo]);

// // Export the types
// export type NodeOneType = z.infer<typeof NodeOne>;
// export type NodeTwoType = z.infer<typeof NodeTwo>;
// export type NodeType = z.infer<typeof Node>;
