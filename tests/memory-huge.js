import { instantiate } from "../lib/wabt-wrapper.js";

// create the memory
const memory = new WebAssembly.Memory({ initial: 0, maximum: 65536 });

// Initialize memory
const pageSize = 64*1024;

// Compile and instantiate module
const instance = instantiate(`
(module
  (memory (import "js" "mem") 0 65536)
  (func (export "memory_grow" ) (param $delta i32) (result i32) (memory.grow (local.get $delta)))
)
`, { js: { mem: memory } });

function check_grow(name, delta, expected) {
  print("Check grow " + name);
  const result = instance.exports.memory_grow(delta);
  if (result !== expected)
    throw "Bad grow, expected: " + expected + " actual: " + result;
}

check_grow("huge", 60000, 0);

// Done
print("PASS")
