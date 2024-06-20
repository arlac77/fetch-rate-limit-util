import test from "ava";
import { BaseEntry, CollectionEntry } from "content-entry";

test("exports present", t => {
  const e1 = new BaseEntry("somewhere");
  t.is(e1.name, "somewhere");
  const e2 = new CollectionEntry("somewhere");
  t.is(e2.name, "somewhere");
});
