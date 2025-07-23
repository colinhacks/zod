import * as z from "zod";

const NodeBase = z.object({
  id: z.string(),
  get children() {
    console.log("accessed");
    return z.array(Node).optional();
  },
});

// typed as any
console.log("nodeone");
const NodeOne = NodeBase.extend({
  name: z.literal("nodeOne"),
  // if this is commented out, NodeTwo becomes any
  get children() {
    return z.array(Node);
  },
});

const NodeTwo = NodeBase.extend({
  name: z.literal("nodeTwo"),
  get children() {
    return z.array(Node);
  },
});

const Node = z.union([NodeOne, NodeTwo]);
