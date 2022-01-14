import { instantiate } from "/home/xan/js/wasm/wabt-wrapper.js";

let instance = instantiate(`
(module
  (func $drop-loop (param i32 i32)
    local.get 0
    local.get 1
    (loop (param i32 i32) (result i32)
      drop
      )
    drop)
  (export "loopdrop" (func $drop-loop)))
`);

instance.exports.loopdrop(0, 1);
