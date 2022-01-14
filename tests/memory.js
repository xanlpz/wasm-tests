import { instantiate } from "../lib/wabt-wrapper.js";

var memory = new WebAssembly.Memory({initial:1, maximum:10});

// let instance = instantiate(`
// (module
//   (memory (import "js" "mem") 1)
//   (func (export "accumulate") (param $ptr i32) (param $len i32) (result i32)
//     (local $end i32)
//     (local $sum i32)
//     (local.set $end (i32.add (local.get $ptr) (i32.mul (local.get $len) (i32.const 4))))
//     (block $break (loop $top
//       (br_if $break (i32.eq (local.get $ptr) (local.get $end)))
//       (local.set $sum (i32.add (local.get $sum)
//                                (i32.load (local.get $ptr))))
//         (local.set $ptr (i32.add (local.get $ptr) (i32.const 4)))
//         (br $top)
//     ))
//     (local.get $sum)
//   )
// )
// `, { js: { mem: memory } });

let instance = instantiate(`
(module
  (memory (import "js" "mem") 1)
  (func (export "accumulate") (param $ptr i32) (param $len i32) (result i32)
    (local $end i32)
    (local $sum i32)
    (local.set $end (i32.add (local.get $ptr) (i32.mul (local.get $len) (i32.const 4))))
    (local.set $ptr (i32.const 2))
    (local.set $sum (i32.add (local.get $sum) (i32.load (local.get $ptr))))
    (local.get $sum)
  )
)
`, { js: { mem: memory } });

var i32 = new Uint32Array(memory.buffer);
for (var i = 0; i < 2; i++) {
    i32[i] = i;
}
var sum = instance.exports.accumulate(0, 2);
print(sum);
