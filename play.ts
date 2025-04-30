import * as z from "zod";

const LinkedList = z.object({
  value: z.number(),
  get parent() {
    return LinkedList;
  },
  get children() {
    return z.array(LinkedList);
  },
});

type LinkedList = z.output<typeof LinkedList>;

const Alazy = z.object({
  val: z.number(),
  get b() {
    return Blazy;
  },
});
type Alazy = z.infer<typeof Alazy>;

const Blazy = z.object({
  val: z.number(),
  get a() {
    return z.optional(Alazy);
  },
});
type Blazy = z.infer<typeof Blazy>;

export type { LinkedList };
