import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $max (result f64)
       f64.const 0.0
       f64.const -0.0
       f64.max)
 (export "watmax" (func $max)))
`);

for (let i = 0; i < 1000; i++) {
if (!Object.is(instance.exports.watmax(), 0.0))
    throw new Error();
}
