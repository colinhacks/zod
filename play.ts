import * as z from "zod";

z;

z.stringFormat("email", /asdf/g);
z.stringFormat("idnEmail", /asdf/g, {
  
});
z.stringFormat("typeid", (val) => {
  return val.length > 10;
}, {
  ""
});


z.jwt({
  
})
