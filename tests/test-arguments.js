import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $argi32 (param i32) (param i32) (param i32) (param i32) (result i32)
       local.get 0
       local.get 1
       local.get 2
       local.get 3
       i32.add
       i32.add
       i32.add)
 (func $argf32 (param f32) (param f32) (param f32) (param f32) (result f32)
       local.get 0
       local.get 1
       local.get 2
       local.get 3
       f32.add
       f32.add
       f32.add)
 (func $argi64 (param i64) (param i64) (param i64) (param i64) (result i64)
       local.get 0
       local.get 1
       local.get 2
       local.get 3
       i64.add
       i64.add
       i64.add)
 (func $argf64 (param f64) (param f64) (param f64) (param f64) (result f64)
       local.get 0
       local.get 1
       local.get 2
       local.get 3
       f64.add
       f64.add
       f64.add)
 (export "watargi32" (func $argi32))
 (export "watargf32" (func $argf32))
 (export "watargi64" (func $argi64))
 (export "watargf64" (func $argf64)))
`);

for (let i = 0; i < 10; i++) {
    let result = instance.exports.watargi32(i, i + 1, i + 2, i + 3);
    let shouldBe = (4 * i) + 6;
    if (!(result == shouldBe)) {
        throw new Error("i32: result should be " + shouldBe + ", instead was: " + result);
    } else {
        print("i32: expected: " + shouldBe + ", result: " + result);
    }
    result = instance.exports.watargf32(i, i + 1, i + 2, i + 3);
    if (!(result == shouldBe)) {
        throw new Error("f32: result should be " + shouldBe + ", instead was: " + result);
    } else {
        print("f32: expected: " + shouldBe + ", result: " + result);
    }
    // FIXME: no implicit BigInt cast needed here?
    result = instance.exports.watargi64(BigInt(i), BigInt(i + 1), BigInt(i + 2), BigInt(i + 3));
    if (!(result == shouldBe)) {
        throw new Error("i64: result should be " + shouldBe + ", instead was: " + result);
    } else {
        print("i64: expected: " + shouldBe + ", result: " + result);
    }
    result = instance.exports.watargf64(i, i + 1, i + 2, i + 3);
    if (!(result == shouldBe)) {
        throw new Error("f64: result should be " + shouldBe + ", instead was: " + result);
    } else {
        print("f64: expected: " + shouldBe + ", result: " + result);
    }
}
print("Success!");
