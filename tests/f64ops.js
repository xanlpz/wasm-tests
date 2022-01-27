import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
  (func (export "add")      (param f64) (param f64) (result f64) (f64.add       (local.get 0) (local.get 1)))
  (func (export "sub")      (param f64) (param f64) (result f64) (f64.sub       (local.get 0) (local.get 1)))
  (func (export "mul")      (param f64) (param f64) (result f64) (f64.mul       (local.get 0) (local.get 1)))
  (func (export "div")      (param f64) (param f64) (result f64) (f64.div       (local.get 0) (local.get 1)))
  (func (export "min")      (param f64) (param f64) (result f64) (f64.min       (local.get 0) (local.get 1)))
  (func (export "max")      (param f64) (param f64) (result f64) (f64.max       (local.get 0) (local.get 1)))
  (func (export "copysign") (param f64) (param f64) (result f64) (f64.copysign  (local.get 0) (local.get 1)))

  (func (export "abs")      (param f64) (result f64) (f64.abs       (local.get 0)))
  (func (export "neg")      (param f64) (result f64) (f64.neg       (local.get 0)))
  (func (export "ceil")     (param f64) (result f64) (f64.ceil      (local.get 0)))
  (func (export "floor")    (param f64) (result f64) (f64.floor     (local.get 0)))
  (func (export "trunc")    (param f64) (result f64) (f64.trunc     (local.get 0)))
  (func (export "nearest")  (param f64) (result f64) (f64.nearest   (local.get 0)))
  (func (export "sqrt")     (param f64) (result f64) (f64.sqrt      (local.get 0)))
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

    getF64Exotic() {
        switch (Number(BigInt.asUintN(32, this.getU64())) % 8) {
          case 0: return Infinity;
          case 1: return -Infinity;
          case 2: return NaN;
          case 3: return -NaN;
          case 4: return +0.0;
          case 5: return -0.0;
          case 6: return this.getF64();
          case 7: return this.getF64();
        }
    }
}

const rng = new Rng("0x0123456789abcdef");

function check_binary(name, ref, gen = () => rng.getF64()) {
  print("Checking " + name);
  const f = instance.exports[name];
  for (let i = 0 ; i < 1000; i++) {
    const lhs = gen();
    const rhs = gen();
    const expected = ref(lhs, rhs);
    const result = f(lhs, rhs);
    if (isNaN(expected) ? !isNaN(result) : result !== expected) {
        throw "Iteration " + i + " | lhs: " + lhs +
          " rhs: " + rhs +
          " expected: " + expected +
          " actual: " + result
    }
  }
}

function check_unary(name, ref, gen = () => rng.getF64()) {
  print("Checking " + name);
  const f = instance.exports[name];
  for (let i = 0 ; i < 1000; i++) {
    const op = gen();
    const expected = ref(op);
    const result = f(op);
    if (isNaN(expected) ? !isNaN(result) : result !== expected) {
        throw "Iteration " + i + " | op: " + op +
          " expected: " + expected +
          " actual: " + result
    }
  }
}

function copysign(a, b) {
  const buf = new ArrayBuffer(16);
  const fbuf = new Float64Array(buf);
  const bbuf = new Uint8Array(buf);
  fbuf[0] = a;
  fbuf[1] = b;
  if (bbuf[15] & 0x80) {
    bbuf[7] = bbuf[7] | 0x80;
  } else {
    bbuf[7] = bbuf[7] & ~0x80;
  }
  return fbuf[0];
}

function nearest(a) {
  if (!isFinite(a)) return a;

  const t = Math.trunc(a);
  const d = a - t;
  if (d > 0.5) return t + 1;
  else if (d == 0.5) return t % 1 ? t + 1 : t;
  else if (d >= -0.5) return t;
  else if (d == -0.5) return t % 1 ? t - 1 : t;
  else return t - 1;
}

// Tests
check_binary("add", (l, r) => l + r);
check_binary("sub", (l, r) => l - r);
check_binary("mul", (l, r) => l * r);
check_binary("div", (l, r) => l / r);
check_binary("min", (l, r) => Math.min(l, r));
check_binary("max", (l, r) => Math.max(l, r));
check_binary("copysign", (l, r) => copysign(l, r));

check_binary("add", (l, r) => l + r, () => rng.getF64Exotic());
check_binary("sub", (l, r) => l - r, () => rng.getF64Exotic());
check_binary("mul", (l, r) => l * r, () => rng.getF64Exotic());
check_binary("div", (l, r) => l / r, () => rng.getF64Exotic());
check_binary("min", (l, r) => Math.min(l, r), () => rng.getF64Exotic());
check_binary("max", (l, r) => Math.max(l, r), () => rng.getF64Exotic());
check_binary("copysign", (l, r) => copysign(l, r));

check_unary("abs",      o => Math.abs(o));
check_unary("neg",      o => -o);
check_unary("sqrt",     o => Math.sqrt(o));
check_unary("trunc",    o => Math.trunc(o));
check_unary("ceil",     o => Math.ceil(o));
check_unary("floor",    o => Math.floor(o));
check_unary("nearest",  o => nearest(o));

check_unary("abs",      o => Math.abs(o)    , () => rng.getF64Exotic());
check_unary("neg",      o => -o             , () => rng.getF64Exotic());
check_unary("sqrt",     o => Math.sqrt(o)   , () => rng.getF64Exotic());
check_unary("trunc",    o => Math.trunc(o)  , () => rng.getF64Exotic());
check_unary("ceil",     o => Math.ceil(o)   , () => rng.getF64Exotic());
check_unary("floor",    o => Math.floor(o)  , () => rng.getF64Exotic());
check_unary("nearest",  o => nearest(o)     , () => rng.getF64Exotic());

