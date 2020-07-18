// import * as z from '.';

// const ZodRHF = <T extends z.ZodType<any,any>>(schema:T)=>(values:any)=>{
//   try{
//     schema.parse(values)
//     return {}
//   }catch(err){
//     return (err as z.ZodError).formErrors.fieldErrors;
//   }
// }

// z.string()
//   .parseAsync(undefined)
//   .catch(err => console.log(JSON.stringify(err.errors, null, 2)));

// export const errorMap: z.ZodErrorMap = (err, ctx) => {
//   if (err.code === z.ZodErrorCode.invalid_type) {
//     if (err.received === 'undefined') {
//       return { message: 'Required.' };
//     }
//   }
//   return { message: ctx.defaultError };
// };
