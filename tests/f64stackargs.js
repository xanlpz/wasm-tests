import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $stackargs (param f64) (param f64) (param f64) (param f64) (param f64) (param f64) (param f64) (param f64) (param f64) (result f64)
       local.get 0
       local.get 1
       local.get 2
       local.get 3
       local.get 4
       local.get 5
       local.get 6
       local.get 7
       local.get 8
       f64.add
       f64.add
       f64.add
       f64.add
       f64.add
       f64.add
       f64.add
       f64.add)
 (export "watstackargs" (func $stackargs)))
`);

for (let i = 0; i < 10; i++) {
    let result = instance.exports.watstackargs(0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9);
    if (!Object.is(result, 4.5))
        throw new Error("Result should be 4.5, instead was " + result);
    else
        print("Success!");
}
