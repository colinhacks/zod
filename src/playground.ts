import { z } from ".";

const run = async () => {
  z;
  const BaseTeacher = z.object({
    subjects: z.array(z.string()),
  });
  const HasID = z.object({ id: z.string() });

  const Teacher = BaseTeacher.merge(HasID);
  const data = {
    subjects: ["math"],
    id: "asdfasdf",
  };
  console.log(Teacher.safeParse({ ...data, extra: 12 }));
};

run();

export {};
