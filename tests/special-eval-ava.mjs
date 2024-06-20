import test from "ava";
import { createContext } from "expression-expander";

function myContext() {
  return createContext({
    evaluate(expression, context, path) {
      const r = expression.match(/(\d+)\s*([+\-*\/])\s*(\d+)/);
      if (r) {
        return r[1] * r[3];
      }
      if (expression === "path") {
        return path.map(o => o.key).join("/");
      }
      return path[0].value;
    }
  });
}

test("expand special user defined string to object", t => {
  t.is(myContext().expand("${2 * 3}"), 6);
});

test("expand special user defined expand with path", t => {
  t.deepEqual(
    myContext().expand({
      key1: "${path}",
      key2: {
        key3: "${path}",
        key4: [0, "${path}"],
        key5: [0, "${value}"]
      }
    }),
    {
      key1: "/key1",
      key2: {
        key3: "/key2/key3",
        key4: [0, "/key2/key4/1"],
        key5: [
          0,
          {
            key1: "${path}",
            key2: {
              key3: "${path}",
              key4: [0, "${path}"],
              key5: [0, "${value}"]
            }
          }
        ]
      }
    }
  );
});
