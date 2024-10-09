interface ZodError {
  issue: true;
}
// type Ctx<O> = { input: O };

// ✅ no error

type Refinement<O = unknown> = {
  // biome-ignore lint:
  (input: O): boolean;
};

interface ZodType<O = any> {
  refinements: Array<Refinement<O>>;
  parse(input: unknown): O;
  refine(refinement: Refinement<O>): this;
}
function ZodType(inst: ZodType): void {
  inst.refinements = [];
  inst.refine = (refinement) => {
    inst.refinements.push(refinement);
    return inst;
  };
}

interface ZodString extends ZodType<string> {
  type: "string";
  min(minimum: number): this;
}

function ZodString(inst: ZodString): void {
  ZodType(inst);
  inst.parse = (input) => {
    if (typeof input !== "string") throw new Error("Invalid type");
    return input;
  };
  inst.min = (minimum) => inst.refine((val) => val.length >= minimum);
}
