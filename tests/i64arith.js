import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
  (func (export "add") (param i64) (param i64) (result i64)
    (i64.add (local.get 0) (local.get 1)))
  (func (export "sub") (param i64) (param i64) (result i64)
    (i64.sub (local.get 0) (local.get 1)))
  (func (export "mul") (param i64) (param i64) (result i64)
    (i64.mul (local.get 0) (local.get 1)))
  (func (export "and") (param i64) (param i64) (result i64)
    (i64.and (local.get 0) (local.get 1)))
  (func (export "or") (param i64) (param i64) (result i64)
    (i64.or  (local.get 0) (local.get 1)))
  (func (export "xor") (param i64) (param i64) (result i64)
    (i64.xor (local.get 0) (local.get 1)))
)`);

// Helpers
class Rng {
    constructor(seed) {
      this.state = BigInt(seed);
    }

    get() {
       let x = this.state;
       x ^= x << 13n;
       x ^= x >> 7n;
       x ^= x << 17n;
       x = BigInt.asUintN(64, x);
       this.state = x;
       return x;
    }
}

const rng = new Rng("0x0123456789abcdef");

function check_binary(name, ref) {
  print("Checking " + name);
  const f = instance.exports[name];
  for (let i = 0 ; i < 1000; i++) {
    const lhs = rng.get();
    const rhs = rng.get();
    const expected = BigInt.asIntN(64, ref(lhs, rhs));
    const result = f(lhs, rhs);
    if (result !== expected) {
        throw "Iteration " + i + " | lhs: 0x" + lhs.toString(16) +
          " rhs: 0x" + rhs.toString(16) +
          " expected: 0x" + BigInt.asUintN(64, expected).toString(16) +
          " actual: 0x" + BigInt.asUintN(64, result).toString(16);
    }
  }
}

// Tests
check_binary("add", (l, r) => l + r);
check_binary("sub", (l, r) => l - r);
check_binary("mul", (l, r) => l * r);
check_binary("and", (l, r) => l & r);
check_binary("or",  (l, r) => l | r);
check_binary("xor", (l, r) => l ^ r);
