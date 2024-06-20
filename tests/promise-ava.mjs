import test from "ava";
import { createContext } from "expression-expander";

test("promise object value", async t => {
  const context = createContext();

  context.properties = {
    thePromise: Promise.resolve("promise value")
  };

  const v = await context.expand({
    some: "${thePromise}"
  });

  t.is(v.some, "promise value");
});

test("promise object key", async t => {
  const context = createContext();

  context.properties = {
    thePromise: Promise.resolve({
      value: "the promise value"
    })
  };

  const v = await context.expand({
    "${thePromise}": {}
  });

  t.deepEqual(v, {
    value: "the promise value"
  });
});

test("promise array index", async t => {
  const context = createContext();

  context.properties = {
    thePromise: Promise.resolve("the promise value"),
    otherPromise: Promise.resolve("other promise value")
  };

  const v = await context.expand([1, 2, "${thePromise} ${otherPromise}", 4]);

  t.deepEqual(v, [1, 2, "the promise value other promise value", 4]);
});

test("promise string expression", async t => {
  const context = createContext();

  context.properties = {
    thePromise: Promise.resolve("the promise value")
  };

  const v = await context.expand("A${thePromise}B");

  t.is(v, "Athe promise valueB");
});
