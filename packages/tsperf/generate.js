import { writeFileSync } from "node:fs";
export const ZOD = {
    imports: [`import * as z from "zod";`],
    schemaType: "z.interface",
    valueTypes: [`z.string()`],
};
export const ZOD3 = {
    imports: [`import * as z from "zod3";`],
    schemaType: "z.object",
    valueTypes: [`z.string()`],
};
export const VALIBOT = {
    imports: [`import * as v from "valibot";`],
    schemaType: "valibot",
    valueTypes: [`v.string()`],
};
export const ARKTYPE = {
    imports: [`import {type} from "arktype";`],
    schemaType: "arktype",
    valueTypes: [`"string"`],
};
generate({
    path: "src/index.ts",
    // ...ZOD3,
    ...ZOD,
    // ...ARKTYPE,
    // ...VALIBOT,
    numSchemas: 100,
    methods: [""],
    numKeys: 10,
    numRefs: 0,
    // numOmits: 10,
    // numPicks: 10,
    // numExtends: 10,
});
// Step 4: Write the generated schemas to a file
export function generate(params) {
    const { path, imports, schemaType, numSchemas, numRefs = 0, numOmits = 0, numPicks = 0, numExtends = 0 } = params;
    // console.log(params);
    let file = [];
    // const file: string[] = params.imports;
    file = file.concat(params.imports);
    const names = Array.from({ length: numSchemas }, () => randomStr(17));
    const generated = [...names];
    console.log(`Generating ${numSchemas} schemas w/ ${params.numKeys} keys and ${numRefs} refs.`);
    for (const variableName of names) {
        // file.push(`export const ${variableName} = { name: "${variableName}" };`);
        // if (1 > 0) continue;
        // open
        if (schemaType === "arktype") {
            file.push(`export const ${variableName} = type({`);
        }
        else if (schemaType === "valibot") {
            file.push(`export const ${variableName} = v.object({`);
        }
        else {
            file.push(`export const ${variableName} = ${schemaType}({`);
        }
        // fields
        const fields = generateFields(params);
        for (const { key, schema } of fields) {
            file.push(`  ${key}: ${schema},`);
        }
        // refs
        if (numRefs > 0 && generated.length > 1) {
            for (let i = 0; i < numRefs; i++) {
                const randomIndex = Math.floor(Math.random() * generated.length);
                const linked = generated[randomIndex];
                if (schemaType === "z.interface") {
                    file.push(`  get ${randomStr(7)}(){\n    return ${linked} as typeof ${linked}\n  },`);
                }
                else if (schemaType === "arktype") {
                    throw new Error("References not supported in arktype.");
                }
                else {
                    file.push(`  get ${randomStr(7)}(){ return ${linked} as typeof ${linked}},`);
                }
            }
        }
        file.push("});");
        file.push(``);
        // file.push(
        //   `export type ${variableName}_input = z.input<typeof ${variableName}>;`
        // );
        // file.push(
        //   `export type ${variableName}_output = z.output<typeof ${variableName}>;`
        // );
        file.push(``);
        const keys = fields.map((field) => field.key);
        // omits
        for (let i = 0; i < numOmits; i++) {
            const varname = randomStr(7);
            const omitKeys = keys.slice(0, keys.length - 1).filter(() => Math.random() > 0.5);
            file.push(`export const ${varname} = ${variableName}.omit({`);
            for (const key of omitKeys) {
                file.push(`  "${key}": true,`);
            }
            file.push(`});`);
        }
        if (numOmits)
            file.push(``);
        // picks
        for (let i = 0; i < numPicks; i++) {
            const varname = randomStr(7);
            const pickKeys = keys.slice(0, keys.length - 1).filter(() => Math.random() > 0.5);
            file.push(`export const ${varname} = ${variableName}.pick({`);
            for (const key of pickKeys) {
                file.push(`  "${key}": true,`);
            }
            file.push(`});`);
        }
        if (numPicks)
            file.push(``);
        // extends
        for (let i = 0; i < numExtends; i++) {
            const varname = randomStr(7);
            const extendKeys = Array(3)
                .fill(0)
                .map(() => randomStr(7));
            file.push(`export const ${varname} = ${variableName}.extend({`);
            for (const key of extendKeys) {
                file.push(`  "${key}": z.string(),`);
            }
            file.push(`});`);
        }
        if (numExtends)
            file.push(``);
        // generated.push(variableName);
    }
    writeFileSync(path, file.join("\n"), { flag: "w" });
}
// Step 2: Generate a random string for keys and variable names
function randomStr(length) {
    const charset = "abcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    return result;
}
// Step 3: Generate a random Zod schema
function generateFields(params) {
    //Math.floor(Math.random() * 30) + 1; // 1-30 keys
    // let schema = `z.interface({`;
    // const keys = [];
    const fields = [];
    for (let i = 0; i < params.numKeys; i++) {
        const key = randomStr(8); // Key name of 8 chars
        // keys.push(key);
        const randomTypeIndex = Math.floor(Math.random() * params.valueTypes.length);
        const randomChainMethodIndex = Math.floor(Math.random() * params.methods.length);
        const randomType = params.valueTypes[randomTypeIndex];
        // const randomChance = Math.random();
        // if (randomChance > 0.98) {
        //   const { schema: nestedSchema } = generateRandomZodSchema();
        //   schema += ` ${key}: ${nestedSchema},`;
        //   continue;
        // }
        const type = randomType + params.methods[randomChainMethodIndex];
        fields.push({ key, schema: type });
        // schema += ` ${key}: ${type},`;
    }
    // schema += " })";
    return fields;
}
