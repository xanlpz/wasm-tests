import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $stackargs (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (param i32) (result i32)
       local.get 0
       local.get 1
       local.get 2
       local.get 3
       local.get 4
       local.get 5
       local.get 6
       local.get 7
       i32.add
       i32.add
       i32.add
       i32.add
       i32.add
       i32.add
       i32.add)
 (export "watstackargs" (func $stackargs)))
`);

for (let i = 0; i < 10; i++) {
    let result = instance.exports.watstackargs(1, 2, 3, 4, 5, 6, 7, 8);
    if (!Object.is(result, 36))
        throw new Error("Result should be 36, instead was " + result);
    else
        print("Success!");
}
