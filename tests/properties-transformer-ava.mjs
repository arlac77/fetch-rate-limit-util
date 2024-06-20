import test from "ava";
import {
  ContentEntry,
  BaseEntry,
  BufferContentEntry,
  ReadableStreamContentEntry,
  StringContentEntry,
  DeletedContentEntry
} from "content-entry";
import { createPropertiesTransformer } from "content-entry-transform";

test("property transform", async t => {
  const pt = createPropertiesTransformer(
    () => true,
    { mode: { value: 4711 }, types: { value: ["public.data"] } },
    "matcherName"
  );

  t.is(pt.name, "matcherName");

  for (const f of [
    ContentEntry,
    BaseEntry,
    BufferContentEntry,
    ReadableStreamContentEntry,
    StringContentEntry,
    DeletedContentEntry
  ]) {
    const entry = await pt.transform(new f("aName"));

    t.is(entry.name, "aName", f.name);

    t.is(entry.mode, 4711, f.name);
    t.deepEqual(entry.types, ["public.data"], f.name);
  }
});
