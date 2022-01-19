import { instantiate } from "../lib/wabt-wrapper.js";

// create the memory
const memory = new WebAssembly.Memory({ initial: 2, maximum: 2 });

// Initialize memory
const pageSize = 64*1024;
const u8mem = new Uint8Array(memory.buffer);
for (var i = 0; i < 2*pageSize; i++) {
    u8mem[i] = 0xff;
}

// Compile and instantiate module
const instance = instantiate(`
(module
  (memory (import "js" "mem") 2 2)
  (func (export "i32_store8" ) (param $addr i32) (i32.store8  (local.get $addr) (i32.const 0x00)))
  (func (export "i32_store16") (param $addr i32) (i32.store16 (local.get $addr) (i32.const 0x1100)))
  (func (export "i32_store32") (param $addr i32) (i32.store   (local.get $addr) (i32.const 0x33221100)))

  (func (export "i64_store8" ) (param $addr i32) (i64.store8  (local.get $addr) (i64.const 0x00)))
  (func (export "i64_store16") (param $addr i32) (i64.store16 (local.get $addr) (i64.const 0x1100)))
  (func (export "i64_store32") (param $addr i32) (i64.store32 (local.get $addr) (i64.const 0x33221100)))
  (func (export "i64_store64") (param $addr i32) (i64.store   (local.get $addr) (i64.const 0x7766554433221100)))

  (func (export "i32_store8_off" ) (param $addr i32) (i32.store8  offset=1 (local.get $addr) (i32.const 0x00)))
  (func (export "i32_store16_off") (param $addr i32) (i32.store16 offset=2 (local.get $addr) (i32.const 0x1100)))
  (func (export "i32_store32_off") (param $addr i32) (i32.store   offset=4 (local.get $addr) (i32.const 0x33221100)))

  (func (export "i64_store8_off" ) (param $addr i32) (i64.store8  offset=1 (local.get $addr) (i64.const 0x00)))
  (func (export "i64_store16_off") (param $addr i32) (i64.store16 offset=2 (local.get $addr) (i64.const 0x1100)))
  (func (export "i64_store32_off") (param $addr i32) (i64.store32 offset=4 (local.get $addr) (i64.const 0x33221100)))
  (func (export "i64_store64_off") (param $addr i32) (i64.store   offset=8 (local.get $addr) (i64.const 0x7766554433221100)))

  (func (export "i32_store8_wrap" ) (param $addr i32) (i32.store8  offset=0xffffffff (local.get $addr) (i32.const 0x00)))
  (func (export "i32_store16_wrap") (param $addr i32) (i32.store16 offset=0xffffffff (local.get $addr) (i32.const 0x1100)))
  (func (export "i32_store32_wrap") (param $addr i32) (i32.store   offset=0xffffffff (local.get $addr) (i32.const 0x33221100)))

  (func (export "i64_store8_wrap" ) (param $addr i32) (i64.store8  offset=0xffffffff (local.get $addr) (i64.const 0x00)))
  (func (export "i64_store16_wrap") (param $addr i32) (i64.store16 offset=0xffffffff (local.get $addr) (i64.const 0x1100)))
  (func (export "i64_store32_wrap") (param $addr i32) (i64.store32 offset=0xffffffff (local.get $addr) (i64.const 0x33221100)))
  (func (export "i64_store64_wrap") (param $addr i32) (i64.store   offset=0xffffffff (local.get $addr) (i64.const 0x776655443322100)))
)
`, { js: { mem: memory } });

// Test wrapper
function check(name, addr, effectiveAddress, size) {
  print("Checking " + name)
  instance.exports[name](addr);
  const lo = effectiveAddress;
  const hi = effectiveAddress + size;
  for (var i = 0 ; i < 2*pageSize; i++) {
      const expected = (lo <= i && i < hi) ? 0x11 * (i - lo) : 0xff;
      const result = u8mem[i];
      if (result !== expected) {
        throw  "Address 0x" + i.toString(16) + " -  expected: 0x" +
          expected.toString(16) + ", got: 0x" + result.toString(16);
      }
      u8mem[i] = 0xff;
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
check("i32_store8",  0, 0, 1)
check("i32_store16", 0, 0, 2)
check("i32_store32", 0, 0, 4)

check("i64_store8",  0, 0, 1)
check("i64_store16", 0, 0, 2)
check("i64_store32", 0, 0, 4)
check("i64_store64", 0, 0, 8)

// Test unaligned accesses
check("i32_store16", 1, 1, 2)
check("i32_store32", 1, 1, 4)

check("i64_store16", 1, 1, 2)
check("i64_store32", 1, 1, 4)
check("i64_store64", 1, 1, 8)

// Test with offset
check("i32_store8_off",  0, 1, 1)
check("i32_store16_off", 0, 2, 2)
check("i32_store32_off", 0, 4, 4)

check("i64_store8_off",  0, 1, 1)
check("i64_store16_off", 0, 2, 2)
check("i64_store32_off", 0, 4, 4)
check("i64_store64_off", 0, 8, 8)

// Test out of bounds accesses
oob("i32_store8",  2*pageSize - 1 + 1)
oob("i32_store16", 2*pageSize - 2 + 1)
oob("i32_store32", 2*pageSize - 4 + 1)

oob("i64_store8",  2*pageSize - 1 + 1)
oob("i64_store16", 2*pageSize - 2 + 1)
oob("i64_store32", 2*pageSize - 4 + 1)
oob("i64_store64", 2*pageSize - 8 + 1)

// Test out of bounds acess due to address wrap
oob("i32_store8_wrap",  0)
oob("i32_store16_wrap", 0)
oob("i32_store32_wrap", 0)

oob("i64_store8_wrap",  0)
oob("i64_store16_wrap", 0)
oob("i64_store32_wrap", 0)
oob("i64_store64_wrap", 0)

// Done
print("PASS")
