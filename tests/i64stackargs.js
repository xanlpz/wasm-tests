import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $stackargs (param i64) (param i64) (param i64) (param i64) (param i64) (param i64) (param i64) (param i64) (param i64) (result i64)
       local.get 0
       local.get 1
       local.get 2
       local.get 3
       local.get 4
       local.get 5
       local.get 6
       local.get 7
       local.get 8
       i64.add
       i64.add
       i64.add
       i64.add
       i64.add
       i64.add
       i64.add
       i64.add)
 (export "watstackargs" (func $stackargs)))
`);

for (let i = 0; i < 10; i++) {
    let result = instance.exports.watstackargs(1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n);
    if (!Object.is(result, 45n))
        throw new Error("Result should be 45, instead was " + result);
    else
        print("Success!");
}
