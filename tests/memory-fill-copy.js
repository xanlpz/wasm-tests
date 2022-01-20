import { instantiate } from "../lib/wabt-wrapper.js";

// create the memory
const memory = new WebAssembly.Memory({ initial: 1, maximum: 1 });

// Initialize memory
const pageSize = 64*1024;

// Compile and instantiate module
const instance = instantiate(`
(module
  (memory (import "js" "mem") 1 1)
  (func (export "memory_fill" ) (param $addr i32)
    (memory.fill (local.get $addr) (i32.const 0xcc) (i32.const 1024)))
  (func (export "memory_copy" ) (param $dst i32)
    (memory.copy (local.get $dst) (i32.add (local.get $dst) (i32.const 128)) (i32.const 256)))
)
`,
{ js: { mem: memory } },
{ bulk_memory: true });

// Helpers
function check_range(lo, hi, expected) {
  const u8 = new Uint8Array(memory.buffer);
  for (var i = lo; i < hi; i++) {
      const result = u8[i];
      if (result !== expected) {
          throw "Memory mismatch at addr 0x" + i.toString(16) +
              " actual: 0x" + result.toString(16) + " expected: 0x" + expected.toString(16);
      }
  }
}

// Test
instance.exports.memory_fill(0);
check_range(0, 1024, 0xcc);
check_range(1024, pageSize, 0);
instance.exports.memory_fill(100);
check_range(0, 1124, 0xcc);
check_range(1124, pageSize, 0);
instance.exports.memory_copy(950);
check_range(0, 950, 0xcc);
check_range(950, 996, 0xcc);
check_range(996, pageSize, 0);

// Done
print("PASS")
