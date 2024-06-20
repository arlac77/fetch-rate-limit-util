import test from "ava";
import { createContext } from "expression-expander";

test("expand Buffer", t => {
  t.deepEqual(
    createContext().expand(Buffer.from([0x17, 0x16])),
    Buffer.from([0x17, 0x16])
  );
});
