// Vitest sets NODE_ENV=test, which switches zod to installing every method as an own property so a test mocker can wrap it. The suite covers the shipped lazy layout, so pin that before zod loads; the test for the eager layout turns it on itself.
(globalThis as any).__zod_globalConfig = { eager: false };
