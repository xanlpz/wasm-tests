import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
  (func (export "add") (param i32) (param i32) (result i32) (i32.add (local.get 0) (local.get 1)))
  (func (export "sub") (param i32) (param i32) (result i32) (i32.sub (local.get 0) (local.get 1)))
  (func (export "mul") (param i32) (param i32) (result i32) (i32.mul (local.get 0) (local.get 1)))
  (func (export "div_u") (param i32) (param i32) (result i32) (i32.div_u (local.get 0) (local.get 1)))
  (func (export "div_s") (param i32) (param i32) (result i32) (i32.div_s (local.get 0) (local.get 1)))
  (func (export "rem_u") (param i32) (param i32) (result i32) (i32.rem_u (local.get 0) (local.get 1)))
  (func (export "rem_s") (param i32) (param i32) (result i32) (i32.rem_s (local.get 0) (local.get 1)))
  (func (export "and") (param i32) (param i32) (result i32) (i32.and (local.get 0) (local.get 1)))
  (func (export "or") (param i32) (param i32) (result i32) (i32.or  (local.get 0) (local.get 1)))
  (func (export "xor") (param i32) (param i32) (result i32) (i32.xor (local.get 0) (local.get 1)))
  (func (export "shl") (param i32) (param i32) (result i32) (i32.shl (local.get 0) (local.get 1)))
  (func (export "shr_u") (param i32) (param i32) (result i32) (i32.shr_u (local.get 0) (local.get 1)))
  (func (export "shr_s") (param i32) (param i32) (result i32) (i32.shr_s (local.get 0) (local.get 1)))
  (func (export "rotl") (param i32) (param i32) (result i32) (i32.rotl (local.get 0) (local.get 1)))
  (func (export "rotr") (param i32) (param i32) (result i32) (i32.rotr (local.get 0) (local.get 1)))
  (func (export "eq") (param i32) (param i32) (result i32) (i32.eq (local.get 0) (local.get 1)))
  (func (export "ne") (param i32) (param i32) (result i32) (i32.ne (local.get 0) (local.get 1)))
  (func (export "lt_u") (param i32) (param i32) (result i32) (i32.lt_u (local.get 0) (local.get 1)))
  (func (export "gt_u") (param i32) (param i32) (result i32) (i32.gt_u (local.get 0) (local.get 1)))
  (func (export "le_u") (param i32) (param i32) (result i32) (i32.le_u (local.get 0) (local.get 1)))
  (func (export "ge_u") (param i32) (param i32) (result i32) (i32.ge_u (local.get 0) (local.get 1)))
  (func (export "lt_s") (param i32) (param i32) (result i32) (i32.lt_s (local.get 0) (local.get 1)))
  (func (export "gt_s") (param i32) (param i32) (result i32) (i32.gt_s (local.get 0) (local.get 1)))
  (func (export "le_s") (param i32) (param i32) (result i32) (i32.le_s (local.get 0) (local.get 1)))
  (func (export "ge_s") (param i32) (param i32) (result i32) (i32.ge_s (local.get 0) (local.get 1)))

  (func (export "ctz") (param i32) (result i32) (i32.ctz (local.get 0)))
  (func (export "clz") (param i32) (result i32) (i32.clz (local.get 0)))
  (func (export "popcnt") (param i32) (result i32) (i32.popcnt (local.get 0)))
  (func (export "eqz") (param i32) (result i32) (i32.eqz (local.get 0)))
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

    getU32() {
      return Number(BigInt.asUintN(32, this.getU64()));
    }

    getI32() {
      return Number(BigInt.asIntN(32, this.getU64()));
    }
}

const rng = new Rng("0x0123456789abcdef");

function check_binary(name, ref, gen = () => rng.getU32()) {
  print("Checking " + name);
  const f = instance.exports[name];
  for (let i = 0 ; i < 1000; i++) {
    const lhs = gen();
    const rhs = gen();
    const expected = Number(BigInt.asIntN(32,ref(BigInt(lhs), BigInt(rhs))));
    const result = f(lhs, rhs);
    if (result !== expected) {
        throw "Iteration " + i + " | lhs: 0x" + lhs.toString(16) +
          " rhs: 0x" + rhs.toString(16) +
          " expected: 0x" + expected.toString(16) +
          " actual: 0x" + result.toString(16) +
          " xor: 0x" + (result ^ expected).toString(16);
    }
  }
}

function check_unary(name, ref, gen = () => rng.getU32()) {
  print("Checking " + name);
  const f = instance.exports[name];
  for (let i = 0 ; i < 1000; i++) {
    const operand = gen();
    const expected = Number(BigInt.asIntN(32, ref(BigInt(operand))));
    const result = f(operand);
    if (result !== expected) {
        throw "Iteration " + i + " | operand: 0x" + operand.toString(16) +
          " expected: 0x" + expected.toString(16) +
          " actual: 0x" + result.toString(16) +
          " xor: 0x" + (BigInt(result) ^ expected).toString(16);
    }
  }
}


// Tests
check_binary("add", (l, r) => l + r);
check_binary("sub", (l, r) => l - r);
check_binary("mul", (l, r) => l * r);
check_binary("div_u", (l, r) => l / r);
check_binary("div_u", (l, r) => l / r, () => rng.getU32() % 10 + 1);
check_binary("div_s", (l, r) => l / r, () => rng.getI32());
check_binary("div_s", (l, r) => l / r, () => (x => x >= 0 ? x + 1 : x - 1)(rng.getI32() % 10));
check_binary("rem_u", (l, r) => l % r);
check_binary("rem_u", (l, r) => l % r, () => rng.getU32() % 10 + 1);
check_binary("rem_s", (l, r) => l % r, () => rng.getI32());
check_binary("rem_s", (l, r) => l % r, () => (x => x >= 0 ? x + 1 : x - 1)(rng.getI32() % 10));
check_binary("and", (l, r) => l & r);
check_binary("or",  (l, r) => l | r);
check_binary("xor", (l, r) => l ^ r);

check_binary("shl",   (l, r) => (s => l << s)(r % 32n));
check_binary("shr_u", (l, r) => (s => l >> s)(r % 32n));
check_binary("shr_s", (l, r) => (s => (l >> s) | (((l >> 31n) * (2n**s-1n)) << (32n - s)))(r % 32n));
check_binary("rotl",  (l, r) => (s => (l << s) | (l >> (32n - s)))(r % 32n));
check_binary("rotr",  (l, r) => (s => (l >> s) | (l << (32n - s)))(r % 32n));

check_binary("eq",   (l, r) => l == r ? 1n : 0n);
check_binary("eq",   (l, r) => l == r ? 1n : 0n, () => rng.getU32() % 4);
check_binary("ne",   (l, r) => l == r ? 0n : 1n);
check_binary("ne",   (l, r) => l == r ? 0n : 1n, () => rng.getU32() % 4);
check_binary("lt_u", (l, r) => l <  r ? 1n : 0n);
check_binary("lt_u", (l, r) => l <  r ? 1n : 0n, () => rng.getU32() % 4);
check_binary("gt_u", (l, r) => l >  r ? 1n : 0n);
check_binary("gt_u", (l, r) => l >  r ? 1n : 0n, () => rng.getU32() % 4);
check_binary("le_u", (l, r) => l <= r ? 1n : 0n);
check_binary("le_u", (l, r) => l <= r ? 1n : 0n, () => rng.getU32() % 4);
check_binary("ge_u", (l, r) => l >= r ? 1n : 0n);
check_binary("ge_u", (l, r) => l >= r ? 1n : 0n, () => rng.getU32() % 4);
check_binary("lt_s", (l, r) => l <  r ? 1n : 0n, () => rng.getI32());
check_binary("lt_s", (l, r) => l <  r ? 1n : 0n, () => rng.getI32() % 4);
check_binary("gt_s", (l, r) => l >  r ? 1n : 0n, () => rng.getI32());
check_binary("gt_s", (l, r) => l >  r ? 1n : 0n, () => rng.getI32() % 4);
check_binary("le_s", (l, r) => l <= r ? 1n : 0n, () => rng.getI32());
check_binary("le_s", (l, r) => l <= r ? 1n : 0n, () => rng.getI32() % 4);
check_binary("ge_s", (l, r) => l >= r ? 1n : 0n, () => rng.getI32());
check_binary("ge_s", (l, r) => l >= r ? 1n : 0n, () => rng.getI32() % 4);

function ctz(n) {
  let result = 0n;
  for (var i = 0n ; i < 32n ; i++) {
    if ((n >> i) & 1n) break; else result++;
  }
  return result;
}

function clz(n) {
  let result = 0n;
  for (var i = 31n ; i >= 0n ; i--) {
    if ((n >> i) & 1n) break; else result++;
  }
  return result;
}

function popcnt(n) {
  let result = 0n;
  for (var i = 0n ; i < 64n ; i++) {
    if ((n >> i) & 1n) result++;
  }
  return result;
}

check_unary("ctz",    o => ctz(o), () => rng.getU32());
check_unary("ctz",    o => ctz(o), () => (rng.getU32() % 4) << 62);
check_unary("clz",    o => clz(o), () => rng.getU32());
check_unary("clz",    o => clz(o), () => rng.getU32() % 4);
check_unary("popcnt", o => popcnt(o), () => rng.getU32());

check_unary("eqz", o => o == 0n ? 1n : 0n);
check_unary("eqz", o => o == 0n ? 1n : 0n, () => rng.getU32() % 4);
