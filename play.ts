import { z } from "zod/v4";

z;

type Element = [string, ElementList];
type ElementList = (Element | string)[];

const ZodElement: z.ZodType<Element> = z.lazy(() => z.tuple([z.string(), ZodElementList]));

const ZodElementList: z.ZodType<ElementList> = z.lazy(() => z.array(z.union([z.string(), ZodElement])));

console.dir(ZodElementList.parse([]), { depth: null });
