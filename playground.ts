import { z } from "./src";
z;
// const schema = z.string().email();
const regex =
  /^([A-Z0-9\!\#\$\%\&\'\*\+\-\/\=\?\^\_\`\{\|\}\~]+\.?)+@[A-Z0-9]([A-Z0-9-]+\.)+[A-Z]{2,}$/i;
console.log(regex.test("user%example.com@example.org"));
