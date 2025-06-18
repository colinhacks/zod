import { z } from "zod/v4";

z;

// function form
const a = z.stringFormat("creditCard", (val) => /\d{16}/.test(val));

// regex form
const b = z.stringFormat("creditCard", /\d{16}/);
b.parse("asdf");
