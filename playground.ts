
import { z } from "./src";

z;

// const enumErrorMap = {
//     errorMap: () => ({ invalid_type_error: "Error Message" }),
// };


// const TestEnum = z.enum(['value1', 'value2'],
const TestEnum = z.nativeEnum({"value1":1, "value2":2},
  { 
    invalid_type_error: "Invalid type",
    required_error: "Required value",
    // errorMap: () => ({ message: "Custom error message" }),
    
  }
);

console.log(TestEnum.safeParse('3').error);; // Custom error message
console.log(TestEnum.safeParse(undefined).error);;

