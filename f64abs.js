import { instantiate } from "/home/xan/js/wasm/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $abs (result f64)
       f64.const -3.5
       f64.abs)
 (export "watabs" (func $abs)))
`);

for (let i = 0; i < 10; i++) {
let result = instance.exports.watabs();
if (!(result == 3.5)) {
    throw new Error("Result should be 3.5, instead was: " + result);
} else {
    print("Expected: 3.5, result: " + result);
}}
print("Success!");
