import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $eq (result i32)
       i64.const 0
       i64.const 1
       i64.eq)
 (export "wateq" (func $eq)))
`);

for (let i = 0; i < 1000; i++) {
if (!Object.is(instance.exports.wateq(), 0))
    throw new Error();
}
