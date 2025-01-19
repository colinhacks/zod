import { $ } from "execa";
import { 
// ARKTYPE, VALIBOT,
ZOD, generate, } from "./generate.js";
/**
 * Target: 300
 * 1, null, 1
 * 1, null, 2
 * 1, null, 4
 * 1, null, 8
 * 1, null, 16
 * 1, null, 32
 * 1, null, 64
 * 1, null, 128
 * 1, null, 256
 * 1, null, 512 (fail)
 * 1, 256, 512
 * 1, 256, 384
 *
 */
const procs = [];
// bisect
let MAX = null;
let MIN = 1;
let CURR = MIN;
// regular object: 43478
// regular interface: 33328
// shape interface: 43472
while (!MAX || MAX - MIN > 10) {
    // CURR = !MAX ? MIN : Math.floor((MAX + MIN) / 2);
    // console.log(`Generating with ${CURR} keys`);
    // await generate({
    //   numSchemas: CURR,
    //   numKeys: 3,
    //   numRefs: 0,
    //   path: "src/index.ts",
    //   schemaType: "z.interface",
    // });
    generate({
        path: "src/index.ts",
        ...ZOD,
        // ...ARKTYPE,
        // ...VALIBOT,
        // schemaType: "z.interface",
        methods: [""],
        numSchemas: 1,
        numKeys: CURR,
        numRefs: 0,
        // numOmits: 10,
        // numPicks: 10,
        // numExtends: 10,
    });
    try {
        console.log(`Attempting tsc compilation...`);
        const _proc = $ `pnpm run bench`;
        procs.push(_proc);
        const proc = await _proc;
        // get instantiations
        const time = proc.stdout.match(/total time:\s+(.+)/i)[1];
        const instantiations = proc.stdout.match(/instantiations:\s+(.+)/i)[1];
        const memory = proc.stdout.match(/memory used:\s+(.+)/i)[1];
        console.log(`Compilation succeeded.\n   Time: ${time}\n   Instantiations: ${instantiations}\n   Memory ${memory}`);
        // console.log(proc.stdout);
        // console.log("failed?", proc.failed);
        // success
        if (!MAX) {
            CURR = CURR * 2;
        }
        else {
            MIN = CURR;
            CURR = Math.floor((MAX + MIN) / 2);
        }
    }
    catch (err) {
        // fail
        console.log("tsc compilation failed...");
        console.log(err);
        MAX = CURR;
        CURR = Math.floor((MAX + MIN) / 2);
    }
    // console.log({ MIN, MAX, CURR });
    // prettier output
    console.log(`Range: [${MIN}, ${MAX}]\nCurrent: ${CURR}`);
    console.log("--------------------");
    if (MAX)
        console.log("diff: ", MAX - MIN);
}
console.log("ANSWER: ", MIN);
// detect control c and process.exit()
process.on("SIGINT", () => {
    for (const proc of procs) {
        proc.kill();
    }
    process.exit();
});
