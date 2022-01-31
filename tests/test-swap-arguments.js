import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
(func $swapi32 (param i32 i32) (result i32 i32)
	(get_local 1) (get_local 0))
(func $swapf32 (param f32 f32) (result f32 f32)
	(get_local 1) (get_local 0))
(func $swapi64 (param i64 i64) (result i64 i64)
	(get_local 1) (get_local 0))
(func $swapf64 (param f64 f64) (result f64 f64)
	(get_local 1) (get_local 0))
(export "swapi32" (func $swapi32))
(export "swapf32" (func $swapf32))
(export "swapi64" (func $swapi64))
(export "swapf64" (func $swapf64)))
`);

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

const arrayEquals = (a, b) =>
  a.length === b.length &&
  a.every((v, i) => v === b[i]);

function check_binary(name, ref, gen = () => rng.getI32()) {
  print("Checking " + name);
  const f = instance.exports[name];
  for (let i = 0 ; i < 1000; i++) {
    const lhs = gen();
    const rhs = gen();
    const expected = ref(lhs, rhs);
    const result = f(lhs, rhs);
    if (!arrayEquals(result, expected)) {
        throw "Iteration " + i + " | lhs: 0x" + lhs.toString(16) +
          " rhs: 0x" + rhs.toString(16) +
          " expected: [" + expected.toString(16) + "]" +
          " actual: [" + result.toString(16) + "]" +
          " xor: 0x" + (result ^ expected).toString(16);
    }
  }
}

// Tests
check_binary("swapi32", (l, r) => [r, l]);
check_binary("swapf32", (l, r) => [r, l], () => rng.getF32());
check_binary("swapi64", (l, r) => [r, l], () => rng.getI64());
check_binary("swapf64", (l, r) => [r, l], () => rng.getF64());
