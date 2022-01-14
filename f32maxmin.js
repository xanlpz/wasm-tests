import { instantiate } from "/home/xan/js/wasm/wabt-wrapper.js";

let instanceMax = instantiate(`
(module
 (func $max (result f32)
       f32.const 0.0
       f32.const -0.0
       f32.max)
 (export "watmax" (func $max)))
`);

for (let i = 0; i < 100; i++) {
    let result = instanceMax.exports.watmax();
    if (!Object.is(result, 0.0))
        throw new Error("Result should be 0.0, instead was:" + result);
}

let instanceMin = instantiate(`
(module
 (func $min (result f32)
       f32.const 0.0
       f32.const -0.0
       f32.min)
 (export "watmin" (func $min)))
`);

for (let i = 0; i < 100; i++) {
    let result = instanceMin.exports.watmin();
    if (!Object.is(result, -0.0))
        throw new Error("Result should be -0.0, instead was:" + result);
}
