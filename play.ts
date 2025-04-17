import * as z from "zod";
const LogLevelNames = ["ERROR", "WARN", "INFO", "DEBUG", "DEBUG_ES", "NONE"] as const;
const ZodLogLevelNames = z.enum(LogLevelNames);
type ZodLogLevelNames = z.infer<typeof ZodLogLevelNames>;

export const ZODSettingsMap = z.object({
  loglevel: ZodLogLevelNames.describe("log level for the server"),
  // .... other props
});
type ZodSettingsMap = z.infer<typeof ZODSettingsMap>;

export type SettingsMap = z.infer<typeof ZODSettingsMap>;
// SettingsMap is now  {
//   loglevel: z.core.$InferEnumOutput<{
//        ERROR: "ERROR";
//        WARN: "WARN";
//        INFO: "INFO";
//        DEBUG: "DEBUG";
//        NONE: "NONE";
//    }>;
//      ....
// }
