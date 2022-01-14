import { instantiate } from "/home/xan/js/wasm/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $add (result i64)
       i64.const 2
       i64.const 3
       i64.add)
 (export "watadd" (func $add)))
`);

for (let i = 0; i < 1000; i++) {
    let result = instance.exports.watadd();
    if (!Object.is(result, BigInt(5)))
        throw new Error("Result was: " + result + ", ( " + typeof(result) + " )");
}
