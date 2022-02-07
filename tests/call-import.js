import { instantiate } from "../lib/wabt-wrapper.js";

let instanceb = instantiate(`
(module
  (func (export "b_i32") (param i32) (result i32) (get_local 0) (i32.const 2) (i32.mul))
  (func (export "b_i64") (param i64) (result i64) (get_local 0) (i64.const 2) (i64.mul))
  (func (export "b_f32") (param f32) (result f32) (get_local 0) (f32.const 2) (f32.mul))
  (func (export "b_f64") (param f64) (result f64) (get_local 0) (f64.const 2) (f64.mul))
)`);

let instancea = instantiate(`
(module
  (func $b_i32 (import "b" "b_i32") (param i32) (result i32))
  (func $b_i64 (import "b" "b_i64") (param i64) (result i64))
  (func $b_f32 (import "b" "b_f32") (param f32) (result f32))
  (func $b_f64 (import "b" "b_f64") (param f64) (result f64))

  (func (export "a_i32") (param i32) (result i32) (get_local 0) call $b_i32)
  (func (export "a_i64") (param i64) (result i64) (get_local 0) call $b_i64)
  (func (export "a_f32") (param f32) (result f32) (get_local 0) call $b_f32)
  (func (export "a_f64") (param f64) (result f64) (get_local 0) call $b_f64)
)`,
  {
    b : {
      b_i32: instanceb.exports.b_i32,
      b_i64: instanceb.exports.b_i64,
      b_f32: instanceb.exports.b_f32,
      b_f64: instanceb.exports.b_f64
    }
  });

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

    getI32() {
      return Number(BigInt.asIntN(32, this.getU64()));
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
}

const rng = new Rng("0x0123456789abcdef");

function check(name, ref, gen) {
  print("Checking " + name);
  const f = instancea.exports[name];
  for (let i = 0 ; i < 1000; i++) {
    const op = gen();
    const expected = ref(op);
    const result = f(op);
    if (result !== expected) {
        throw "Iteration " + i + " | op: 0x" + op.toString(16) +
          " expected: [" + expected.toString(16) + "]" +
          " actual: [" + result.toString(16) + "]" +
          " xor: 0x" + (result ^ expected).toString(16);
    }
  }
}

// Tests
check("a_i32", x => x * 2 , () => rng.getI32() % 2**30);
check("a_i64", x => x * 2n, () => rng.getI64() % 2n**62n);
check("a_f32", x => x * 2 , () => rng.getF32());
check("a_f64", x => x * 2 , () => rng.getF64());
