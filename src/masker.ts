import * as z from './types/base';
import { ZodDef, ZodObject } from '.';
// import { util } from './helpers/util';;
// import { ZodArray } from './types/array';
// import { ZodObject } from './types/object';
// import { ZodUnion } from './types/union';
// import { ZodIntersection } from './types/intersection';
// import { ZodTuple } from './types/tuple';
// import { ZodRecord } from './types/record';
// import { ZodLazy } from './types/lazy';
// import { ZodError } from './ZodError';
import { ParamVisitor } from './sampleParamVisitor';
// import { ZodObject } from './types/object';

// type Params = any; //{ [k: string]: boolean | Params } | boolean;

export const Masker = ParamVisitor((schema, params) => {
  const def: ZodDef = schema._def as any;
  console.log(`visiting ${def.t}`);
  console.log(`params: ${JSON.stringify(params, null, 2)}`, null, 2);
  if (def.t === z.ZodTypes.object) {
    console.log(schema);
    // console.log(JSON.stringify(params, null, 2));
    const visitedShape: any = {};
    for (const key in def.shape) {
      if (params[key]) {
        visitedShape[key] = def.shape[key];
      }
    }
    return ZodObject.create(visitedShape);
  } else {
    return schema;
  }
});

// export const Masker = (visit: (_schema: z.ZodAny, params: Params) => z.ZodAny) => (
//   schema: z.ZodAny,
//   params: Params,
// ) => {
//   const def: ZodDef = schema._def as any;
//   if (params === true) return schema;
//   if (typeof params !== 'object') throw new Error('Invalid params');
//   if (Array.isArray(params)) throw new Error('Invalid params');

//   switch (def.t) {
//     case z.ZodTypes.string:
//       return visit(schema, params);
//     case z.ZodTypes.number:
//       return visit(schema, params);
//     case z.ZodTypes.boolean:
//       return visit(schema, params);
//     case z.ZodTypes.date:
//       return visit(schema, params);
//     case z.ZodTypes.undefined:
//       return visit(schema, params);
//     case z.ZodTypes.null:
//       return visit(schema, params);
//     case z.ZodTypes.array:
//       return visit(
//         new ZodArray({
//           ...def,
//           type: visit(def.type, params),
//         }),
//         params,
//       );
//     case z.ZodTypes.object:
//       const visitedShape: any = {};
//       for (const key in def.shape) {
//         if (params[key]) {
//           visitedShape[key] = visit(def.shape[key], params[key]);
//           // if(params[key] === true){
//           //   visitedShape[key] = def.shape[key]
//           // }else if(typeof params === "object"){
//           //   visitedShape[key] = visit(def.shape[key], params[key]);
//           // }
//         }
//       }
//       return visit(
//         new ZodObject({
//           ...def,
//           shape: visitedShape,
//         }),
//         params,
//       );
//     case z.ZodTypes.union:
//       return visit(
//         new ZodUnion({
//           ...def,
//           options: def.options.map(option => visit(option, params)) as any,
//         }),
//         params,
//       );
//     case z.ZodTypes.intersection:
//       return visit(
//         new ZodIntersection({
//           ...def,
//           left: visit(def.left, params),
//           right: visit(def.left, params),
//         }),
//         params,
//       );
//     case z.ZodTypes.tuple:
//       return visit(
//         new ZodTuple({
//           ...def,
//           items: def.items.map(item => visit(item, params)) as any,
//         }),
//         params,
//       );
//     case z.ZodTypes.record:
//       return visit(
//         new ZodRecord({
//           ...def,
//           valueType: visit(def.valueType, params),
//         }),
//         params,
//       );
//     case z.ZodTypes.lazy:
//       return visit(
//         new ZodLazy({
//           ...def,
//           getter: () => visit(def.getter(), params),
//         }),
//         params,
//       );
//     case z.ZodTypes.literal:
//       return visit(schema, params);
//     case z.ZodTypes.enum:
//       return visit(schema, params);
//     default:
//       util.assertNever(def);
//       break;
//   }
//   throw ZodError.fromString(`Unknown schema type.`);
// };
