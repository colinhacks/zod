import { toJSONSchema } from "@zod/core";
import { z } from "zod";

const email = z.email();
const A = z.interface({
  email,
  get b() {
    return B;
  },
  get a() {
    return A;
  },
});

const B = z.interface({
  email,
  get a() {
    return A;
  },
  get b() {
    return B;
  },
});

const myReg = z.registry<{ id: string }>();
myReg.add(A, { id: "A" });
myReg.add(B, { id: "B" });

const result = toJSONSchema(myReg, { reused: "ref", uri: (id) => `https://stuff.org/${id}.json` });
console.log(JSON.stringify(result, null, 2));
