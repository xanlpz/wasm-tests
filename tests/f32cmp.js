import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
  (func (export "eq") (param f32) (param f32) (result i32) (f32.eq (local.get 0) (local.get 1)))
  (func (export "ne") (param f32) (param f32) (result i32) (f32.ne (local.get 0) (local.get 1)))
  (func (export "lt") (param f32) (param f32) (result i32) (f32.lt (local.get 0) (local.get 1)))
  (func (export "gt") (param f32) (param f32) (result i32) (f32.gt (local.get 0) (local.get 1)))
  (func (export "le") (param f32) (param f32) (result i32) (f32.le (local.get 0) (local.get 1)))
  (func (export "ge") (param f32) (param f32) (result i32) (f32.ge (local.get 0) (local.get 1)))
)`);

// Helpers
class Rng {
    constructor(seed) {
      this.state = BigInt(seed);
    }

    getU64() {
       let x = this.state;
       x ^= x << 13n;
       x ^= x >> 7n;
       x ^= x << 17n;
       x = BigInt.asUintN(64, x);
       this.state = x;
       return x;
    }

    getI64() {
        return BigInt.asIntN(64, this.getU64());
    }

    getF64(lo = 0.0, hi = 1.0) {
        let num = Number(BigInt.asUintN(32, this.getU64())) / 2**32;
        return num * (hi - lo) + lo;
    }

    getF32(lo = 0.0, hi = 1.0) {
        return Math.fround(this.getF64(lo, hi))
    }

    getF32Exotic() {
        switch (Number(BigInt.asUintN(32, this.getU64())) % 8) {
          case 0: return Infinity;
          case 1: return -Infinity;
          case 2: return NaN;
          case 3: return -NaN;
          case 4: return +0.0;
          case 5: return -0.0;
          case 6: return this.getF32();
          case 7: return this.getF32();
        }
    }
}

const rng = new Rng("0x0123456789abcdef");

function check_binary(name, ref, gen = () => rng.getF32()) {
  print("Checking " + name);
  const f = instance.exports[name];
  for (let i = 0 ; i < 1000; i++) {
    const lhs = gen();
    const rhs = gen();
    const expected = ref(lhs, rhs) ? 1 : 0;
    const result = f(lhs, rhs);
    if (result !== expected) {
        throw "Iteration " + i + " | lhs: " + lhs +
          " rhs: " + rhs +
          " expected: " + expected +
          " actual: " + result
    }
  }
}

// Tests
check_binary("eq", (l, r) => l == r);
check_binary("ne", (l, r) => l != r);
check_binary("lt", (l, r) => l <  r);
check_binary("gt", (l, r) => l >  r);
check_binary("le", (l, r) => l <= r);
check_binary("ge", (l, r) => l >= r);

check_binary("eq", (l, r) => l == r, () => rng.getF32Exotic());
check_binary("ne", (l, r) => l != r, () => rng.getF32Exotic());
check_binary("lt", (l, r) => l <  r, () => rng.getF32Exotic());
check_binary("gt", (l, r) => l >  r, () => rng.getF32Exotic());
check_binary("le", (l, r) => l <= r, () => rng.getF32Exotic());
check_binary("ge", (l, r) => l >= r, () => rng.getF32Exotic());

