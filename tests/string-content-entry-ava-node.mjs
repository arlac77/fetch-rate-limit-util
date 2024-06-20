import test from "ava";
import { StringContentEntry } from "content-entry";

test("string content entry create", async t => {
  const entry = new StringContentEntry("somewhere", "abc");
  t.is(entry.name, "somewhere");
  t.false(entry.isEmpty);
  t.false(entry.isCollection);
  t.true(entry.isBlob);
  t.is(entry.size, 3);
  t.is(entry.mode, 420);
  t.is(entry.encoding, "utf8");

  t.deepEqual(JSON.parse(JSON.stringify(entry)), {
    name: "somewhere",
    isBlob: true,
    isCollection: false
  });
  t.is(await entry.string, "abc");
  t.is((await entry.buffer).length, 3);

  const stream = await entry.getReadStream();
  const chunks = [];
  for await( const chunk of stream) {
    chunks.push(chunk);
  }

  t.is(chunks[0].length, 3);
});
