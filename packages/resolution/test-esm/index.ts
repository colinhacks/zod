import * as z1 from "zod";
import z2 from "zod";
import {z as z3} from "zod";
import * as z4 from "zod/v4";
import * as z5 from "zod/v3";
import * as z6 from "zod/v4/mini";
import * as z7 from "zod/v4-mini";
import fr from "zod/v4/locales/fr.js";


console.log(z1.string().parse("Hello, world!"));;
console.log(z2.string().parse("Hello, world!"));;
console.log(z3.string().parse("Hello, world!"));;
console.log(z4.string().parse("Hello, world!"));;
console.log(z5.string().parse("Hello, world!"));;
console.log(z6.string().parse("Hello, world!"));;
console.log(z7.string().parse("Hello, world!"));;

z4.config(fr())

