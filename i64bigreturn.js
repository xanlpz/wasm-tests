import { instantiate } from "/home/xan/js/wasm/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $ret (result i64)
       i64.const 9223372036854775807)
 (export "watret" (func $ret)))
`);

for (let i = 0; i < 10; i++) {
    let result = instance.exports.watret();
    if (!(result == BigInt(9223372036854775807)))
        throw new Error("Result should be 9223372036854775807, instead was: " + result);
}
print("Success!");
