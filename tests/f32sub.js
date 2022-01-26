import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $sub (result f32)
       f32.const 0.5
       f32.const 1.0
       f32.sub)
 (export "watsub" (func $sub)))
`);

for (let i = 0; i < 10; i++) {
let result = instance.exports.watsub();
if (!(result == -0.5)) {
    throw new Error("Result should be -0.5, instead was: " + result);
} else {
    print("Expected: -0.5, result: " + result);
}}
print("Success!");
