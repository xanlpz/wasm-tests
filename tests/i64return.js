import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $ret (result i64)
       i64.const 255)
 (export "watret" (func $ret)))
`);

for (let i = 0; i < 10; i++) {
let result = instance.exports.watret();
if (!Object.is(result, BigInt(255)))
    throw new Error("Result should be 255, instead was: " + result);
}
print("Success!");

