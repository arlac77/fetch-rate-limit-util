import test from "ava";
import { StringContentEntry } from "content-entry";
import { createExpressionTransformer } from "content-entry-transform";

test("property transform", async t => {
  const pt = createExpressionTransformer(
    () => true,
    { a: 1, b: 2 },
    "matcherName"
  );
  const entry = await pt.transform(
    new StringContentEntry("aName", "X{{a}}Y{{b}}Z")
  );

  t.is(pt.name, "matcherName");

  console.log(entry);
  t.is(entry.name, "aName");
  const string = await entry.string;
  t.is(typeof string, "string");
  t.is(string, "X1Y2Z");
});

test("property transform deep", async t => {
  const pt = createExpressionTransformer(
    () => true,
    { a: "a{{b}}a", b: "b{{c}}{{d}}b", c: 3, d: "4" },
    "matcherName"
  );
  const entry = await pt.transform(new StringContentEntry("aName", "X{{a}}Y"));

  t.is(pt.name, "matcherName");

  t.is(entry.name, "aName");
  t.is(await entry.string, "Xab34baY");
});

test("property transform circular", async t => {
  const pt = createExpressionTransformer(
    () => true,
    { a: "{{b}}", b: "{{c}}", c: "{{a}}" },
    "matcherName"
  );

  try {
    const entry = await pt.transform(
      new StringContentEntry("aName", "X{{a}}Y")
    );

    t.is(await entry.string, "Xab3baY");

    t.fail("unreachable");
  } catch (e) {
    t.is(e.message, "Probably circular reference evaluating: a");
  }
});

test.skip("property transform unbalanced", async t => {
  const pt = createExpressionTransformer(() => true, {}, "matcherName");

  const entry = await pt.transform(
    new StringContentEntry("aName", "X{{a open end")
  );

  t.is(await entry.string, "X{{a open end");
});
