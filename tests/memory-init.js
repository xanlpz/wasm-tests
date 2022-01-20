import { instantiate } from "../lib/wabt-wrapper.js";

// create the memory
const memory = new WebAssembly.Memory({ initial: 1, maximum: 1 });

// Initialize memory
const pageSize = 64*1024;

// Compile and instantiate module
// (module
//   (memory (import "js" "mem") 1 1)
//   (data $a "abcd")
//   (data $b "xyzw")
//   (func (export "memory_init_a") (param $dst i32)
//     (memory.init $a (local.get $dst) (i32.const 0) (i32.const 3)))
//   (func (export "memory_init_b") (param $dst i32)
//     (memory.init $b (local.get $dst) (i32.const 1) (i32.const 3)))
//   (func (export "drop_a") (data.drop $a))
//   (func (export "drop_b") (data.drop $b))
// )
// But in libwabt.js means Data Count segment is not emitted, and the result
// then does not pass validation. This is the binary fed through wat2wasm.
const bin = new Uint8Array([
0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x60, 0x01,
0x7f, 0x00, 0x60, 0x00, 0x00, 0x02, 0x0c, 0x01, 0x02, 0x6a, 0x73, 0x03, 0x6d,
0x65, 0x6d, 0x02, 0x01, 0x01, 0x01, 0x03, 0x05, 0x04, 0x00, 0x00, 0x01, 0x01,
0x07, 0x33, 0x04, 0x0d, 0x6d, 0x65, 0x6d, 0x6f, 0x72, 0x79, 0x5f, 0x69, 0x6e,
0x69, 0x74, 0x5f, 0x61, 0x00, 0x00, 0x0d, 0x6d, 0x65, 0x6d, 0x6f, 0x72, 0x79,
0x5f, 0x69, 0x6e, 0x69, 0x74, 0x5f, 0x62, 0x00, 0x01, 0x06, 0x64, 0x72, 0x6f,
0x70, 0x5f, 0x61, 0x00, 0x02, 0x06, 0x64, 0x72, 0x6f, 0x70, 0x5f, 0x62, 0x00,
0x03, 0x0c, 0x01, 0x02, 0x0a, 0x27, 0x04, 0x0c, 0x00, 0x20, 0x00, 0x41, 0x00,
0x41, 0x03, 0xfc, 0x08, 0x00, 0x00, 0x0b, 0x0c, 0x00, 0x20, 0x00, 0x41, 0x01,
0x41, 0x03, 0xfc, 0x08, 0x01, 0x00, 0x0b, 0x05, 0x00, 0xfc, 0x09, 0x00, 0x0b,
0x05, 0x00, 0xfc, 0x09, 0x01, 0x0b, 0x0b, 0x0d, 0x02, 0x01, 0x04, 0x61, 0x62,
0x63, 0x64, 0x01, 0x04, 0x78, 0x79, 0x7a, 0x77]).buffer
const module = new WebAssembly.Module(bin);
const instance = new WebAssembly.Instance(module, { js: { mem: memory } });

// Helpers
function check_range(lo, hi, expected) {
  print("Check range " + lo + " " + hi);
  const u8 = new Uint8Array(memory.buffer);
  for (var i = lo; i < hi; i++) {
      const result = u8[i];
      if (result !== expected) {
          throw "Memory mismatch at addr 0x" + i.toString(16) +
              " actual: 0x" + result.toString(16) + " expected: 0x" + expected.toString(16);
      }
  }
}

function check(addr, expected) {
  print("Checking 0x" + addr.toString(16));
  const u8 = new Uint8Array(memory.buffer);
  const result = u8[addr];
  if (result !== expected) {
      throw "Memory mismatch at addr 0x" + addr.toString(16) +
          " actual: 0x" + result.toString(16) + " expected: 0x" + expected.toString(16);
  }
}

function oob(name, f) {
  print("Out of bounds " + name)
  try {
    f();
  } catch (e) {
    if (e instanceof WebAssembly.RuntimeError && e.message.startsWith("Out of bounds memory access")) {
      return;
    }
    throw e;
  }
  throw "Exception expected but was not thrown"
}

// Test
check_range(0, pageSize, 0);
instance.exports.memory_init_a(0);
check(0, 'a'.charCodeAt(0));
check(1, 'b'.charCodeAt(0));
check(2, 'c'.charCodeAt(0));
check_range(3, pageSize, 0);
instance.exports.memory_init_a(10);
check(0, 'a'.charCodeAt(0));
check(1, 'b'.charCodeAt(0));
check(2, 'c'.charCodeAt(0));
check(10, 'a'.charCodeAt(0));
check(11, 'b'.charCodeAt(0));
check(12, 'c'.charCodeAt(0));
check_range(3, 10, 0);
check_range(13, pageSize, 0);
instance.exports.memory_init_b(2);
check(0, 'a'.charCodeAt(0));
check(1, 'b'.charCodeAt(0));
check(2, 'y'.charCodeAt(0));
check(3, 'z'.charCodeAt(0));
check(4, 'w'.charCodeAt(0));
check(10, 'a'.charCodeAt(0));
check(11, 'b'.charCodeAt(0));
check(12, 'c'.charCodeAt(0));
check_range(5, 10, 0);
check_range(13, pageSize, 0);
instance.exports.drop_a();
oob("dropped a", () => instance.exports.memory_init_a(0));
instance.exports.drop_a();
instance.exports.memory_init_b(5);
check(0, 'a'.charCodeAt(0));
check(1, 'b'.charCodeAt(0));
check(2, 'y'.charCodeAt(0));
check(3, 'z'.charCodeAt(0));
check(4, 'w'.charCodeAt(0));
check(5, 'y'.charCodeAt(0));
check(6, 'z'.charCodeAt(0));
check(7, 'w'.charCodeAt(0));
check(10, 'a'.charCodeAt(0));
check(11, 'b'.charCodeAt(0));
check(12, 'c'.charCodeAt(0));
check_range(8, 10, 0);
check_range(13, pageSize, 0);
instance.exports.drop_b();
oob("dropped b", () => instance.exports.memory_init_b(0));

// Done
print("PASS")
