import test from "ava";
import { createContext } from "expression-expander";

test("expand string to object", t => {
  const context = createContext();

  context.properties = {
    moreThanOne: {
      a: 1,
      b: 2
    }
  };

  const expanded = context.expand("${moreThanOne}");
  t.is(expanded.a, 1);
  t.is(expanded.b, 2);
});

test("expand string in array to object", t => {
  const context = createContext();

  context.properties = {
    moreThanOne: {
      a: 1,
      b: 2
    }
  };

  const expanded = context.expand(["${moreThanOne}", 2, 3]);

  t.is(expanded[0].a, 1);
  t.is(expanded[0].b, 2);
  t.is(expanded[1], 2);
});

test("expand object key to object", t => {
  const context = createContext();

  context.properties = {
    moreThanOne: {
      a: 1,
      b: 2
    }
  };

  const expanded = context.expand({
    "${moreThanOne}": {}
  });

  t.is(expanded.a, 1);
  t.is(expanded.b, 2);
});

test("expand object value to object", t => {
  const context = createContext();

  context.properties = {
    moreThanOne: {
      a: 1,
      b: 2
    }
  };

  const expanded = context.expand({
    aKey: "${moreThanOne}"
  });

  t.is(expanded.aKey.a, 1);
  t.is(expanded.aKey.b, 2);
});
