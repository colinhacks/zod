import * as z from "zod";
z;

const jobId = z
  .string()
  .refine(() => {
    // complex validation logic
    return true;
  })
  .meta({ id: "jobId" });

// console.log(jobId);
const prevJobId = jobId.describe("previousJobId");

console.log(
  JSON.stringify(
    z.toJSONSchema(
      z.object({
        current: jobId,
        previous: prevJobId,
      }),
      {
        reused: "ref",
      }
    ),
    null,
    2
  )
);
