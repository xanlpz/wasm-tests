import { instantiate } from "../lib/wabt-wrapper.js";

// create the memory
const memory = new WebAssembly.Memory({ initial: 2, maximum: 2 });

// Initialize memory
const pageSize = 64*1024;
const u16 = new Uint16Array(memory.buffer);
for (var i = 0; i < pageSize; i++) {
    u16[i] = i & 0xffff;
}

// Compile and instantiate module
const instance = instantiate(`
(module
  (memory (import "js" "mem") 2 2)
  (func (export "i32_load8_u" ) (param $addr i32) (result i32) (i32.load8_u  (local.get $addr)))
  (func (export "i32_load16_u") (param $addr i32) (result i32) (i32.load16_u (local.get $addr)))
  (func (export "i32_load32_u") (param $addr i32) (result i32) (i32.load     (local.get $addr)))

  (func (export "i32_load8_s" ) (param $addr i32) (result i32) (i32.load8_s  (local.get $addr)))
  (func (export "i32_load16_s") (param $addr i32) (result i32) (i32.load16_s (local.get $addr)))

  (func (export "i64_load8_u" ) (param $addr i32) (result i64) (i64.load8_u  (local.get $addr)))
  (func (export "i64_load16_u") (param $addr i32) (result i64) (i64.load16_u (local.get $addr)))
  (func (export "i64_load32_u") (param $addr i32) (result i64) (i64.load32_u (local.get $addr)))
  (func (export "i64_load64_u") (param $addr i32) (result i64) (i64.load     (local.get $addr)))

  (func (export "i64_load8_s" ) (param $addr i32) (result i64) (i64.load8_s  (local.get $addr)))
  (func (export "i64_load16_s") (param $addr i32) (result i64) (i64.load16_s (local.get $addr)))
  (func (export "i64_load32_s") (param $addr i32) (result i64) (i64.load32_s (local.get $addr)))

  (func (export "i32_load8_u_off" ) (param $addr i32) (result i32) (i32.load8_u  offset=1 (local.get $addr)))
  (func (export "i32_load16_u_off") (param $addr i32) (result i32) (i32.load16_u offset=2 (local.get $addr)))
  (func (export "i32_load32_u_off") (param $addr i32) (result i32) (i32.load     offset=4 (local.get $addr)))

  (func (export "i32_load8_s_off" ) (param $addr i32) (result i32) (i32.load8_s  offset=1 (local.get $addr)))
  (func (export "i32_load16_s_off") (param $addr i32) (result i32) (i32.load16_s offset=2 (local.get $addr)))

  (func (export "i64_load8_u_off" ) (param $addr i32) (result i64) (i64.load8_u  offset=1 (local.get $addr)))
  (func (export "i64_load16_u_off") (param $addr i32) (result i64) (i64.load16_u offset=2 (local.get $addr)))
  (func (export "i64_load32_u_off") (param $addr i32) (result i64) (i64.load32_u offset=4 (local.get $addr)))
  (func (export "i64_load64_u_off") (param $addr i32) (result i64) (i64.load     offset=8 (local.get $addr)))

  (func (export "i64_load8_s_off" ) (param $addr i32) (result i64) (i64.load8_s  offset=1 (local.get $addr)))
  (func (export "i64_load16_s_off") (param $addr i32) (result i64) (i64.load16_s offset=2 (local.get $addr)))
  (func (export "i64_load32_s_off") (param $addr i32) (result i64) (i64.load32_s offset=4 (local.get $addr)))

  (func (export "i32_load8_u_wrap" ) (param $addr i32) (result i32) (i32.load8_u  offset=0xffffffff (local.get $addr)))
  (func (export "i32_load16_u_wrap") (param $addr i32) (result i32) (i32.load16_u offset=0xffffffff (local.get $addr)))
  (func (export "i32_load32_u_wrap") (param $addr i32) (result i32) (i32.load     offset=0xffffffff (local.get $addr)))

  (func (export "i32_load8_s_wrap" ) (param $addr i32) (result i32) (i32.load8_s  offset=0xffffffff (local.get $addr)))
  (func (export "i32_load16_s_wrap") (param $addr i32) (result i32) (i32.load16_s offset=0xffffffff (local.get $addr)))

  (func (export "i64_load8_u_wrap" ) (param $addr i32) (result i64) (i64.load8_u  offset=0xffffffff (local.get $addr)))
  (func (export "i64_load16_u_wrap") (param $addr i32) (result i64) (i64.load16_u offset=0xffffffff (local.get $addr)))
  (func (export "i64_load32_u_wrap") (param $addr i32) (result i64) (i64.load32_u offset=0xffffffff (local.get $addr)))
  (func (export "i64_load64_u_wrap") (param $addr i32) (result i64) (i64.load     offset=0xffffffff (local.get $addr)))

  (func (export "i64_load8_s_wrap" ) (param $addr i32) (result i64) (i64.load8_s  offset=0xffffffff (local.get $addr)))
  (func (export "i64_load16_s_wrap") (param $addr i32) (result i64) (i64.load16_s offset=0xffffffff (local.get $addr)))
  (func (export "i64_load32_s_wrap") (param $addr i32) (result i64) (i64.load32_s offset=0xffffffff (local.get $addr)))
)
`, { js: { mem: memory } });

// Test wrapper
function test(name, lo, hi, by, e) {
  print("Runnig " + name)
  const f = instance.exports[name]
  for (var addr = lo ; addr < hi; addr += by) {
    const expected = e(addr)
    const result = f(addr)
    if (result !== expected) {
      throw "Address 0x" + addr.toString(16) + " -  expected: 0x" +
        expected.toString(16) + ", got: 0x" + result.toString(16);
    }
  }
}

function check(name, addr, expected) {
  print("Checking " + name)
  const f = instance.exports[name]
  const result = f(addr)
  if (result !== expected) {
      throw "Address 0x" + addr.toString(16) + " -  expected: 0x" +
        expected.toString(16) + ", got: 0x" + result.toString(16);
  }
}

function oob(name, addr) {
  print("Out of bounds " + name)
  try {
    instance.exports[name](addr)
  } catch (e) {
    if (e instanceof WebAssembly.RuntimeError && e.message.startsWith("Out of bounds memory access")) {
      return;
    }
    throw e;
  }
  throw "Exception expected but was not thrown"
}

// Test aligned accesses
test("i32_load8_u",               0,            512, 1, a => (h => a & 1 ? 0 : h)(a/2))
test("i32_load16_u",              0,            512, 2, a => (h => h)(a/2))
test("i32_load32_u",              0,            512, 4, a => (h => ((h+1) << 16) | h)(a/2))

test("i32_load8_s",               0,            512, 1, a => (h => a & 1 ? 0 : h >= 2**7 ? h - 2**8 : h)(a/2))
test("i32_load16_s", pageSize - 512, pageSize + 512, 2, a => (h => a >= pageSize ? h - 2**16 : h)(a/2))

test("i64_load8_u",               0,            512, 1, a => (h => BigInt(a & 1 ? 0 : h))(a/2))
test("i64_load16_u",              0,            512, 2, a => (h => BigInt(h))(a/2))
test("i64_load32_u",              0,            512, 4, a => (h => BigInt(((h + 1) << 16) | h))(a/2))
test("i64_load64_u",              0,            512, 8, a => (h => BigInt(h + 3) << BigInt(48) | BigInt(h + 2) << BigInt(32) | BigInt(h + 1) << BigInt(16) | BigInt(h))(a/2))

test("i64_load8_s",               0,            512, 1, a => (h => BigInt(a & 1 ? 0 : h >= 2**7 ? h - 2**8 : h))(a/2))
test("i64_load16_s", pageSize - 512, pageSize + 512, 2, a => (h => BigInt(a >= pageSize ? h - 2**16 : h))(a/2))
test("i64_load32_s", pageSize - 512, pageSize + 512, 4, a => (h => a >= pageSize ? (BigInt(h + 1) << BigInt(16) | BigInt(h)) - BigInt(2**32)  : BigInt(h + 1) << BigInt(16) | BigInt(h))(a/2))

// Test unaligned accesses
check("i32_load16_u", 1, 0x0100)
check("i32_load32_u", 1, 0x02000100)

check("i32_load16_s", 0x80*2 - 1, 0xffff8000 - 2**32)

check("i64_load16_u", 1, BigInt("0x0100"))
check("i64_load32_u", 1, BigInt("0x02000100"))
check("i64_load64_u", 1, BigInt("0x0400030002000100"))

check("i64_load16_s", 0x80*2 - 1, BigInt("0xffffffffffff8000") - BigInt(2)**BigInt(64))
check("i64_load32_s", 0x80*2 - 3, BigInt("0xffffffff80007f00") - BigInt(2)**BigInt(64))

// Test with offset
test("i32_load8_u_off",               0,            511, 1, _ => (a => (h => a & 1 ? 0 : h)(a/2))(_ + 1))
test("i32_load16_u_off",              0,            511, 2, _ => (a => (h => h)(a/2))(_ + 2))
test("i32_load32_u_off",              0,            511, 4, _ => (a => (h => ((h+1) << 16) | h)(a/2))(_ + 4))

test("i32_load8_s_off",               0,            511, 1, _ => (a => (h => a & 1 ? 0 : h >= 2**7 ? h - 2**8 : h)(a/2))(_ + 1))
test("i32_load16_s_off", pageSize - 512, pageSize + 511, 2, _ => (a => (h => a >= pageSize ? h - 2**16 : h)(a/2))(_ + 2))

test("i64_load8_u_off",               0,            511, 1, _ => (a => (h => BigInt(a & 1 ? 0 : h))(a/2))(_ + 1))
test("i64_load16_u_off",              0,            511, 2, _ => (a => (h => BigInt(h))(a/2))(_ + 2))
test("i64_load32_u_off",              0,            511, 4, _ => (a => (h => BigInt(((h + 1) << 16) | h))(a/2))(_ + 4))
test("i64_load64_u_off",              0,            511, 8, _ => (a => (h => BigInt(h + 3) << BigInt(48) | BigInt(h + 2) << BigInt(32) | BigInt(h + 1) << BigInt(16) | BigInt(h))(a/2))(_ + 8))

test("i64_load8_s_off",               0,            511, 1, _ => (a => (h => BigInt(a & 1 ? 0 : h >= 2**7 ? h - 2**8 : h))(a/2))(_ + 1))
test("i64_load16_s_off", pageSize - 512, pageSize + 511, 2, _ => (a => (h => BigInt(a >= pageSize ? h - 2**16 : h))(a/2))(_ + 2))
test("i64_load32_s_off", pageSize - 512, pageSize + 511, 4, _ => (a => (h => a >= pageSize ? (BigInt(h + 1) << BigInt(16) | BigInt(h)) - BigInt(2**32)  : BigInt(h + 1) << BigInt(16) | BigInt(h))(a/2))(_ + 4))

// Test out of bounds accesses
oob("i32_load8_u",  2*pageSize - 1 + 1)
oob("i32_load16_u", 2*pageSize - 2 + 1)
oob("i32_load32_u", 2*pageSize - 4 + 1)

oob("i32_load8_s",  2*pageSize - 1 + 1)
oob("i32_load16_s", 2*pageSize - 2 + 1)

oob("i64_load8_u",  2*pageSize - 1 + 1)
oob("i64_load16_u", 2*pageSize - 2 + 1)
oob("i64_load32_u", 2*pageSize - 4 + 1)
oob("i64_load64_u", 2*pageSize - 8 + 1)

oob("i64_load8_s",  2*pageSize - 1 + 1)
oob("i64_load16_s", 2*pageSize - 2 + 1)
oob("i64_load32_s", 2*pageSize - 4 + 1)

// Test out of bounds acess due to address wrap
oob("i32_load8_u_wrap",  0)
oob("i32_load16_u_wrap", 0)
oob("i32_load32_u_wrap", 0)

oob("i32_load8_s_wrap",  0)
oob("i32_load16_s_wrap", 0)

oob("i64_load8_u_wrap",  0)
oob("i64_load16_u_wrap", 0)
oob("i64_load32_u_wrap", 0)
oob("i64_load64_u_wrap", 0)

oob("i64_load8_s_wrap",  0)
oob("i64_load16_s_wrap", 0)
oob("i64_load32_s_wrap", 0)

// Done
print("PASS")
