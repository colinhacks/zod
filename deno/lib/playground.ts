import { z } from "./index.ts";
import { ZodIssueCode } from "./ZodError.ts";

const Person = z.object({
  id: z.string(),
});

const People = z.array(Person).refine(
  (people) => !findDuplicateIds(people).next().done,
  (people) => ({
    message: `person IDs must be unique, but found duplicates: ${[
      ...findDuplicateIds(people),
    ].join(", ")}`,
  })
);

function* findDuplicateIds<T extends { id: unknown }>(
  identifiables: Iterable<T>
): Generator<T["id"]> {
  const knownIds = new Set<T["id"]>();

  for (const { id } of identifiables) {
    if (knownIds.has(id)) {
      yield id;
    } else {
      knownIds.add(id);
    }
  }
}

const run = async () => {
  z;

  const People = z.array(Person).superRefine((people, ctx) => {
    const duplicateIds = [...findDuplicateIds(people)];
    if (duplicateIds.length) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: `person IDs must be unique, but found duplicates: ${duplicateIds.join(
          ", "
        )}`,
      });
    }
  });
};

run();

export {};
