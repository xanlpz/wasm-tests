//import { instantiate } from "./was../lib/wabt-wrapper.js";
import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $add (result i32)
       i32.const 5
       i32.const 15
       i32.add)
 (func $mul (result i32)
       i32.const 6
       i32.const 4
       i32.mul)
 (func $and (result i32)
       i32.const 10
       i32.const 5
       i32.and)
 (func $or (result i32)
       i32.const 10
       i32.const 5
       i32.or)
 (func $shl (result i32)
       i32.const 8
       i32.const 2
       i32.shl)
 (func $shru (result i32)
       i32.const 8
       i32.const 2
       i32.shr_u)
 (func $shrs (result i32)
       i32.const 8
       i32.const 2
       i32.shr_s)
 (func $rotl (result i32)
       i32.const 1073741824
       i32.const 2
       i32.rotl)
 (func $rotr (result i32)
       i32.const 1
       i32.const 2
       i32.rotr)

 (export "watadd" (func $add))
 (export "watmul" (func $mul))
 (export "wator" (func $or))
 (export "watshl" (func $shl))
 (export "watshru" (func $shru))
 (export "watshrs" (func $shrs))
 (export "watrotl" (func $rotl))
 (export "watrotr" (func $rotr))
 (export "watand" (func $and)))
`);

function checkResult(expected, actual)
{
    if (!(actual == expected)) {
        throw new Error("Result should be " + expected + ", instead was: " + actual);
    } else {
        print("Expected: " + expected + ", result: " + actual);
    }
}

for (let i = 0; i < 10; i++) {
    let result = instance.exports.watadd();
    checkResult(20, result);    
    result = instance.exports.watmul();
    checkResult(24, result);
    result = instance.exports.watand();
    checkResult(0, result);
    result = instance.exports.wator();
    checkResult(15, result);
    result = instance.exports.watshl();
    checkResult(32, result);
    result = instance.exports.watshru();
    checkResult(2, result);
    //FIXME: use a proper example for shr_s
    result = instance.exports.watshrs();
    checkResult(2, result);
    //FIXME: verify what's up with the sign in these
    result = instance.exports.watrotl();
    checkResult(1, result);
    result = instance.exports.watrotr();
    checkResult(1073741824, result);
}
print("Success!");
