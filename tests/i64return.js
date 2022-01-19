import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
 (func $ret (result i64)
       i64.const 0x00_22_44_66_00_aa_cc_ee)
 (export "watret" (func $ret)))
`);

const expect = BigInt("0x0022446600aaccee")
for (let i = 0; i < 10; i++) {
  const result = instance.exports.watret();
  if (!Object.is(result, expect))
      throw new Error("Result should be 0x" + expect.toString(16) + ", instead was: 0x" + result.toString(16));
}
print("Success!");

