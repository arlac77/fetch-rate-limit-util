import test from "ava";
import { CollectionEntry } from "content-entry";

test("collection entry create", async t => {
  const entry = new CollectionEntry("somewhere");
  t.is(entry.name, "somewhere");
  t.is(entry.mode, 0o755);
  t.true(entry.isCollection);
  t.true((entry.types).indexOf("public.directory") === 0);
});

test("collection entry equals", async t => {
  const a = new CollectionEntry("a");
  const a2 = new CollectionEntry("a");
  const b = new CollectionEntry("b");
  t.false(await a.equals(b));
  t.true(await a.equals(a));
  t.true(await a.equals(a2));
});
