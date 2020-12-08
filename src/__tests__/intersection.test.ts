import * as z from "..";

test("object intersection", () => {
  const BaseTeacher = z.object({
    subjects: z.array(z.string()),
  });
  const HasID = z.object({ id: z.string() });

  const Teacher = z.intersection(BaseTeacher.passthrough(), HasID); // BaseTeacher.merge(HasID);
  const data = {
    subjects: ["math"],
    id: "asdfasdf",
  };
  expect(Teacher.parse(data)).toEqual(data);
  expect(() => Teacher.parse({ subject: data.subjects })).toThrow();
  expect(Teacher.parse({ ...data, extra: 12 })).toEqual({ ...data, extra: 12 });

  expect(() =>
    z.intersection(BaseTeacher.strict(), HasID).parse({ ...data, extra: 12 })
  ).toThrow();
});
