const path = require("path")
const fs = require("fs")

const imp = `
const test = Deno.test;
import { expect } from "https://deno.land/x/expect/mod.ts";
`.trim()

const dir = path.join(__dirname, `/../deno_lib/__tests__`)
console.log(dir)
fs.readdir(dir, (err, files) => {
    files.map(file => {
        fs.readFile(path.join(dir, file), 'utf8', function (err,data) {
            if (err) { return console.log(err) }
            fs.writeFile(path.join(dir, file), imp + data, (err) => {
                if (err) { return console.log(err) }
            })
        });
    })


})