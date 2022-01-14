import { instantiate } from "../lib/wabt-wrapper.js";

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

let instance = instantiate(`
(module
 (func $ret (result i64)
       i64.const 9223372036854775807)
 (export "watret" (func $ret)))
`);

for (let i = 0; i < 10; i++) {
    let result = instance.exports.watret();
    print("The result is: " + result + ", expected is: " +
BigInt(9223372036854775807));
    if (!(result == BigInt(9223372036854775807)))
        throw new Error("Result should be " + dec2bin(9223372036854775807) +
",instead was: " + dec2bin(Number(result)));
}
print("Success!");
