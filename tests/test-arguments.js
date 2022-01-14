import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $argi32 (param i32) (result i32)
       local.get 0)
 (func $argf32 (param f32) (result f32)
       local.get 0)
 (func $argi64 (param i64) (result i64)
       local.get 0)
 (func $argf64 (param f64) (result f64)
       local.get 0)
 (export "watargi32" (func $argi32))
 (export "watargf32" (func $argf32))
 (export "watargi64" (func $argi64))
 (export "watargf64" (func $argf64)))
`);

for (let i = 0; i < 10; i++) {
    let result = instance.exports.watargi32(i);
    if (!(result == i)) {
        throw new Error("i32: result should be " + i + ", instead was: " + result);
    } else {
        print("i32: expected: " + i + ", result: " + result);
    }
    result = instance.exports.watargf32(i);
    if (!(result == i)) {
        throw new Error("f32: result should be " + i + ", instead was: " + result);
    } else {
        print("f32: expected: " + i + ", result: " + result);
    }
    // FIXME: no implicit BigInt cast needed here?
    result = instance.exports.watargi64(BigInt(i));
    if (!(result == i)) {
        throw new Error("i64: result should be " + i + ", instead was: " + result);
    } else {
        print("i64: expected: " + i + ", result: " + result);
    }
    result = instance.exports.watargf64(i);
    if (!(result == i)) {
        throw new Error("f64: result should be " + i + ", instead was: " + result);
    } else {
        print("f64: expected: " + i + ", result: " + result);
    }
}
print("Success!");
