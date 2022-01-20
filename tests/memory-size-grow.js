import { instantiate } from "../lib/wabt-wrapper.js";

// create the memory
const memory = new WebAssembly.Memory({ initial: 1, maximum: 10 });

// Initialize memory
const pageSize = 64*1024;

// Compile and instantiate module
const instance = instantiate(`
(module
  (memory (import "js" "mem") 1 10)
  (func (export "memory_size" ) (result i32) (memory.size))
  (func (export "memory_grow" ) (param $delta i32) (result i32) (memory.grow (local.get $delta)))
  (func (export "i32_load8_u" ) (param $addr i32) (result i32) (i32.load8_u  (local.get $addr)))
)
`, { js: { mem: memory } });


// Helpers
function memset(lo, hi) {
  const u8 = new Uint8Array(memory.buffer);
  for (var i = lo; i < hi; i++) {
      u8[i] = i & 0xff;
  }
}

function check_zero(lo, hi) {
  const u8 = new Uint8Array(memory.buffer);
  for (var i = lo; i < hi; i++) {
      const result = u8[i];
      if (result !== 0)
          throw "Memory non zero (0x" + result.toString(16) + ") at addr 0x" + i.toString(16);
  }
}

function check_size(name, expected) {
  print("Check size " + name);
  const result = instance.exports.memory_size();
  if (result !== expected)
    throw "Bad size, expected: " + expected + " actual: " + result;
}

function check_grow(name, delta, expected) {
  print("Check grow " + name);
  const result = instance.exports.memory_grow(delta);
  if (result !== expected)
    throw "Bad grow, expected: " + expected + " actual: " + result;
}


function check_load(name, addr, expected) {
  print("Check load " + name);
  const result = instance.exports.i32_load8_u(addr);
  if (result !== expected) {
      throw "Address 0x" + addr.toString(16) + " -  expected: 0x" +
        expected.toString(16) + ", got: 0x" + result.toString(16);
  }
}

function oob(name, addr) {
  print("Out of bounds " + name);
  try {
    instance.exports.i32_load8_u(addr)
  } catch (e) {
    if (e instanceof WebAssembly.RuntimeError && e.message.startsWith("Out of bounds memory access")) {
      return;
    }
    throw e;
  }
  throw "Exception expected but was not thrown"
}

// Test
check_zero(0, pageSize);
memset(0, pageSize);
check_size("should be 1", 1);
check_load("addr 0", 0, 0);
check_load("addr 1*pageSize: - 1", pageSize - 1, 0xff);
oob("addr 1*pageSize", pageSize);
check_grow("grow by 1", 1, 1);
check_size("should be 2", 2);
check_zero(pageSize, 2*pageSize);
check_grow("grow by 0", 0, 2);
check_size("should be still 2", 2);
memset(pageSize, 2*pageSize);
check_load("addr 2*pageSize: - 1", 2*pageSize - 1, 0xff);
oob("addr 2*pageSize", 2*pageSize);
check_grow("grow by 5", 5, 2);
check_zero(2*pageSize, 7*pageSize);
check_size("should be 7", 7);
oob("addr 7*pageSize", 7*pageSize);
check_grow("grow by 10", 10, -1);
check_size("should be 7", 7);
oob("addr 7*pageSize", 7*pageSize);

// Done
print("PASS")
