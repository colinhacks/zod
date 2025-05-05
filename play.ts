import * as z from "zod";

console.log(
  JSON.stringify(
    z.toJSONSchema(
      z.object({
        jobId: z.string().default("foo"), // or .catch()
      }),
      {
        reused: "ref",
        io: "input",
      }
    ),
    null,
    2
  )
);

/**
 * {
  "type": "object",
  "properties": {
    "jobId": {
      "type": "string",
      "default": "foo"
    }
  },
  "required": []
}
 */
