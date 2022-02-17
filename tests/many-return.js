import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
  (func (export "f") (result i32 f32 f32 f32 f32 f32 f32 f32 i32 f32 f32 f64)
    (i32.const 0)
    (f32.const 1)
    (f32.const 2)
    (f32.const 3)
    (f32.const 4)
    (f32.const 5)
    (f32.const 6)
    (f32.const 7)
    (i32.const 8)
    (f32.const 9)
    (f32.const 10)
    (f64.const 11)
  )
)
`);

let result = instance.exports.f()

for (let index = 0 ; index < 12 ; index++) {
  if (result[index] !== index)
    throw "bad " + index + " expected: " + index + " actual: " + result[index];
}
