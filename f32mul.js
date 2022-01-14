import { instantiate } from "/home/xan/js/wasm/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $mul (result f32)
       f32.const 5.0
       f32.const 6.0
       f32.mul)
 (export "watmul" (func $mul)))
`);

for (let i = 0; i < 10; i++) {
let result = instance.exports.watmul();
if (!(result == 30.0)) {
    throw new Error("Result should be 30.0, instead was: " + result);
} else {
    print("Expected: 30.0, result: " + result);
}}
print("Success!");
