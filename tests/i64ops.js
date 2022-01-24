import { instantiate } from "../lib/wabt-wrapper.js";

let instance = instantiate(`
(module
  (func (export "add") (param i64) (param i64) (result i64) (i64.add (local.get 0) (local.get 1)))
  (func (export "sub") (param i64) (param i64) (result i64) (i64.sub (local.get 0) (local.get 1)))
  (func (export "mul") (param i64) (param i64) (result i64) (i64.mul (local.get 0) (local.get 1)))
  (func (export "div_u") (param i64) (param i64) (result i64) (i64.div_u (local.get 0) (local.get 1)))
  (func (export "div_s") (param i64) (param i64) (result i64) (i64.div_s (local.get 0) (local.get 1)))
  (func (export "rem_u") (param i64) (param i64) (result i64) (i64.rem_u (local.get 0) (local.get 1)))
  (func (export "rem_s") (param i64) (param i64) (result i64) (i64.rem_s (local.get 0) (local.get 1)))
  (func (export "and") (param i64) (param i64) (result i64) (i64.and (local.get 0) (local.get 1)))
  (func (export "or") (param i64) (param i64) (result i64) (i64.or  (local.get 0) (local.get 1)))
  (func (export "xor") (param i64) (param i64) (result i64) (i64.xor (local.get 0) (local.get 1)))
  (func (export "shl") (param i64) (param i64) (result i64) (i64.shl (local.get 0) (local.get 1)))
  (func (export "shr_u") (param i64) (param i64) (result i64) (i64.shr_u (local.get 0) (local.get 1)))
  (func (export "shr_s") (param i64) (param i64) (result i64) (i64.shr_s (local.get 0) (local.get 1)))
  (func (export "rotl") (param i64) (param i64) (result i64) (i64.rotl (local.get 0) (local.get 1)))
  (func (export "rotr") (param i64) (param i64) (result i64) (i64.rotr (local.get 0) (local.get 1)))
  (func (export "eq") (param i64) (param i64) (result i32) (i64.eq (local.get 0) (local.get 1)))
  (func (export "ne") (param i64) (param i64) (result i32) (i64.ne (local.get 0) (local.get 1)))
  (func (export "lt_u") (param i64) (param i64) (result i32) (i64.lt_u (local.get 0) (local.get 1)))
  (func (export "gt_u") (param i64) (param i64) (result i32) (i64.gt_u (local.get 0) (local.get 1)))
  (func (export "le_u") (param i64) (param i64) (result i32) (i64.le_u (local.get 0) (local.get 1)))
  (func (export "ge_u") (param i64) (param i64) (result i32) (i64.ge_u (local.get 0) (local.get 1)))
  (func (export "lt_s") (param i64) (param i64) (result i32) (i64.lt_s (local.get 0) (local.get 1)))
  (func (export "gt_s") (param i64) (param i64) (result i32) (i64.gt_s (local.get 0) (local.get 1)))
  (func (export "le_s") (param i64) (param i64) (result i32) (i64.le_s (local.get 0) (local.get 1)))
  (func (export "ge_s") (param i64) (param i64) (result i32) (i64.ge_s (local.get 0) (local.get 1)))

  (func (export "ctz") (param i64) (result i64) (i64.ctz (local.get 0)))
  (func (export "clz") (param i64) (result i64) (i64.clz (local.get 0)))
  (func (export "popcnt") (param i64) (result i64) (i64.popcnt (local.get 0)))
  (func (export "eqz") (param i64) (result i32) (i64.eqz (local.get 0)))
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
}

const rng = new Rng("0x0123456789abcdef");

function check_binary(name, ref, resultCvt, gen) {
  print("Checking " + name);
  const f = instance.exports[name];
  for (let i = 0 ; i < 1000; i++) {
    const lhs = gen();
    const rhs = gen();
    const expected = resultCvt(ref(lhs, rhs));
    const result = f(lhs, rhs);
    if (result !== expected) {
        throw "Iteration " + i + " | lhs: 0x" + lhs.toString(16) +
          " rhs: 0x" + rhs.toString(16) +
          " expected: 0x" + BigInt.asUintN(64, BigInt(expected)).toString(16) +
          " actual: 0x" + BigInt.asUintN(64, BigInt(result)).toString(16) +
          " xor: 0x" +  (BigInt.asUintN(64, BigInt(result)) ^ BigInt.asUintN(64, BigInt(expected))).toString(16);
    }
  }
}

function check_binary_i64_result(name, ref, gen = () => rng.getU64()) {
  check_binary(name, ref, _ => BigInt.asIntN(64, _), gen)
}
function check_binary_i32_result(name, ref, gen = () => rng.getU64()) {
  check_binary(name, ref, _ => _, gen)
}

function check_unary(name, ref, resultCvt, gen) {
  print("Checking " + name);
  const f = instance.exports[name];
  for (let i = 0 ; i < 1000; i++) {
    const operand = gen();
    const expected = resultCvt(ref(operand));
    const result = f(operand);
    if (result !== expected) {
        throw "Iteration " + i + " | operand: 0x" + operand.toString(16) +
          " expected: 0x" + BigInt.asUintN(64, BigInt(expected)).toString(16) +
          " actual: 0x" + BigInt.asUintN(64, BigInt(result)).toString(16) +
          " xor: 0x" +  (BigInt.asUintN(64, BigInt(result)) ^ BigInt.asUintN(64, BigInt(expected))).toString(16);
    }
  }
}

function check_unary_i64_result(name, ref, gen = () => rng.getU64()) {
  check_unary(name, ref, _ => BigInt.asIntN(64, _), gen)
}
function check_unary_i32_result(name, ref, gen = () => rng.getU64()) {
  check_unary(name, ref, _ => _, gen)
}

// Tests
check_binary_i64_result("add", (l, r) => l + r);
check_binary_i64_result("sub", (l, r) => l - r);
check_binary_i64_result("mul", (l, r) => l * r);
check_binary_i64_result("div_u", (l, r) => l / r);
check_binary_i64_result("div_u", (l, r) => l / r, () => rng.getU64() % 10n + 1n);
check_binary_i64_result("div_s", (l, r) => l / r, () => rng.getI64());
check_binary_i64_result("div_s", (l, r) => l / r, () => (x => x >= 0n ? x + 1n : x - 1n)(rng.getI64() % 10n));
check_binary_i64_result("rem_u", (l, r) => l % r);
check_binary_i64_result("rem_u", (l, r) => l % r, () => rng.getU64() % 10n + 1n);
check_binary_i64_result("rem_s", (l, r) => l % r, () => rng.getI64());
check_binary_i64_result("rem_s", (l, r) => l % r, () => (x => x >= 0n ? x + 1n : x - 1n)(rng.getI64() % 10n));
check_binary_i64_result("and", (l, r) => l & r);
check_binary_i64_result("or",  (l, r) => l | r);
check_binary_i64_result("xor", (l, r) => l ^ r);

check_binary_i64_result("shl",   (l, r) => (s => l << s)(r % 64n));
check_binary_i64_result("shr_u", (l, r) => (s => l >> s)(r % 64n));
check_binary_i64_result("shr_s", (l, r) => (s => (l >> s) | (((l >> 63n) * (2n**s-1n)) << (64n - s)))(r % 64n));
check_binary_i64_result("rotl",  (l, r) => (s => (l << s) | (l >> (64n - s)))(r % 64n));
check_binary_i64_result("rotr",  (l, r) => (s => (l >> s) | (l << (64n - s)))(r % 64n));

check_binary_i32_result("eq",   (l, r) => l == r ? 1 : 0);
check_binary_i32_result("eq",   (l, r) => l == r ? 1 : 0, () => rng.getU64() % 4n);
check_binary_i32_result("ne",   (l, r) => l == r ? 0 : 1);
check_binary_i32_result("ne",   (l, r) => l == r ? 0 : 1, () => rng.getU64() % 4n);
check_binary_i32_result("lt_u", (l, r) => l <  r ? 1 : 0);
check_binary_i32_result("lt_u", (l, r) => l <  r ? 1 : 0, () => rng.getU64() % 4n);
check_binary_i32_result("gt_u", (l, r) => l >  r ? 1 : 0);
check_binary_i32_result("gt_u", (l, r) => l >  r ? 1 : 0, () => rng.getU64() % 4n);
check_binary_i32_result("le_u", (l, r) => l <= r ? 1 : 0);
check_binary_i32_result("le_u", (l, r) => l <= r ? 1 : 0, () => rng.getU64() % 4n);
check_binary_i32_result("ge_u", (l, r) => l >= r ? 1 : 0);
check_binary_i32_result("ge_u", (l, r) => l >= r ? 1 : 0, () => rng.getU64() % 4n);
check_binary_i32_result("lt_s", (l, r) => l <  r ? 1 : 0, () => rng.getI64());
check_binary_i32_result("lt_s", (l, r) => l <  r ? 1 : 0, () => rng.getI64() % 4n);
check_binary_i32_result("gt_s", (l, r) => l >  r ? 1 : 0, () => rng.getI64());
check_binary_i32_result("gt_s", (l, r) => l >  r ? 1 : 0, () => rng.getI64() % 4n);
check_binary_i32_result("le_s", (l, r) => l <= r ? 1 : 0, () => rng.getI64());
check_binary_i32_result("le_s", (l, r) => l <= r ? 1 : 0, () => rng.getI64() % 4n);
check_binary_i32_result("ge_s", (l, r) => l >= r ? 1 : 0, () => rng.getI64());
check_binary_i32_result("ge_s", (l, r) => l >= r ? 1 : 0, () => rng.getI64() % 4n);

function ctz(n) {
  let result = 0n;
  for (var i = 0n ; i < 64n ; i++) {
    if ((n >> i) & 1n) break; else result++;
  }
  return result;
}

function clz(n) {
  let result = 0n;
  for (var i = 63n ; i >= 0 ; i--) {
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

check_unary_i64_result("ctz",    o => ctz(o), () => rng.getU64());
check_unary_i64_result("ctz",    o => ctz(o), () => (rng.getU64() % 4n) << 62n);
check_unary_i64_result("clz",    o => clz(o), () => rng.getU64());
check_unary_i64_result("clz",    o => clz(o), () => rng.getU64() % 4n);
check_unary_i64_result("popcnt", o => popcnt(o), () => rng.getU64());

check_unary_i32_result("eqz", o => o == 0n ? 1 : 0);
check_unary_i32_result("eqz", o => o == 0n ? 1 : 0, () => rng.getU64() % 4n);
