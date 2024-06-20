import test from "ava";
import { ContentEntry } from "content-entry";

test("content entry create", async t => {
  const entry = new ContentEntry("somewhere");
  t.is(entry.name, "somewhere");
  t.is(entry.name, "somewhere");
  t.is(entry.encoding, "utf8");
  t.true(entry.isEmpty);
  t.true(entry.isBlob);
  t.is(entry.mode, 420);
  t.deepEqual(entry.mtime, new Date(0));
  t.true(entry.types.indexOf("public.content") === 0);

  t.is(await entry.buffer.length, 0);
  t.is(await entry.string, "");

  const readStream = entry.readStream;

  t.true(readStream !== undefined);
  const reader = readStream.getReader();
  const result = await reader.read();

  t.true(result.done);
});

test("content entry equals", async t => {
  const a = new ContentEntry("a");
  const a2 = new ContentEntry("a");
  const b = new ContentEntry("b");
  t.false(await a.equals(b));
  t.true(await a.equals(a));
  t.true(await a.equals(a2));
});

test("content entry equalsContent", async t => {
  const a = new ContentEntry("a");
  const b = new ContentEntry("b");
  t.true(await a.equalsContent(b));
  t.true(await a.equalsContent(a));
  t.true(await b.equalsContent(a));
});

test("content entry equalsContent undefined", async t => {
  const a = new ContentEntry("a");
  t.false(await a.equalsContent());
});
