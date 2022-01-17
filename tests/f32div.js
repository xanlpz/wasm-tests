import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $div (result f32)
       f32.const 30.0
       f32.const 5.0
       f32.div)
 (export "watdiv" (func $div)))
`);

for (let i = 0; i < 10; i++) {
let result = instance.exports.watdiv();
if (!(result == 6.0)) {
    throw new Error("Result should be 6.0, instead was: " + result);
} else {
    print("Expected: 6.0, result: " + result);
}}
print("Success!");
