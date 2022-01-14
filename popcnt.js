import { instantiate } from "/home/xan/js/wasm/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $popcnt32 (result i32)
       i32.const 135
       i32.popcnt)
 (export "watpopcnt32" (func $popcnt32))
 (func $popcnt64 (result i64)
       i64.const 0xFFFFFFFFFFFFFFFF
       i64.popcnt)
 (export "watpopcnt64" (func $popcnt64)))
`);

let expected = 4;
let result = instance.exports.watpopcnt32();
if (!Object.is(result, expected))
    throw new Error("i32.popcnt: result should be '" + expected + "', instead it is: '" + result + "'");

expected = BigInt(64);
result = instance.exports.watpopcnt64();
if (!Object.is(result, expected))
    throw new Error("i64.popcnt: result should be '" + expected + "' (" + typeof expected + "), instead it is: '" + result + "' (" + typeof result + ")");

print("Success!")
