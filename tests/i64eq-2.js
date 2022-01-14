import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $eq (result i32)
       i64.const 255
       i64.const 255
       i64.eq)
 (export "wateq" (func $eq)))
`);

for (let i = 0; i < 100; i++) {
if (!Object.is(instance.exports.wateq(), 1))
    throw new Error();
}
print("Success!");
