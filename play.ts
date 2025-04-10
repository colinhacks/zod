import jwt from "jsonwebtoken";
import * as z from "zod";

z;

const jwtSchema = z.string().jwt();

const payload = {
  sub: "1234567890",
  name: "John Doe",
  iat: 1516239022,
};

const secret = "your-256-bit-secret";

const NO_TYP = jwt.sign(payload, secret, { algorithm: "HS256", noTimestamp: true });

const NO_TYP2 =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.GuoUe6tw79bJlbU1HU0ADX0pr0u2kf3r_4OdrDufSfQ";

console.log({ NO_TYP, NO_TYP2 });
console.log(jwtSchema.parse(NO_TYP));
