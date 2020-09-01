import * as z from '.';

const rawServiceSchema = z.object({
  // configPath: z.string(),
  port: z.number().positive(),
  // realApi: z.string().url(),
  // rateLimit: z
  //   .number()
  //   .positive()
  //   .optional(),
});
const rawNcdcConfigSchema = z.record(rawServiceSchema);

const rawDataToParse = {
  Config1: {
    // configPath: './my-file.yml',
    port: 5001,
    // realApi: 'http://example.com',
  },
  Config2: {
    // configPath: './my-file.yml',
    port: 5002,
    // realApi: 'http://example.com',
  },
  // this one is missing a port so I expect a validation error to be thrown
  'Another Config': {
    // configPath: './my-file.yml',
    // realApi: 'http://example.com',
  },
};

const parsed = rawNcdcConfigSchema.safeParse(rawDataToParse);
console.log(JSON.stringify(parsed, null, 2));
