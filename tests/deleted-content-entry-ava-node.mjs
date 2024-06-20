import test from "ava";
import { streamToUint8Array } from "browser-stream-util";
import { DeletedContentEntry } from "content-entry";

test("deleted content entry create", async t => {
  const entry = new DeletedContentEntry("somewhere");
  t.is(entry.name, "somewhere");
  t.false(entry.isCollection);
  t.true(entry.isBlob);
  t.true(entry.isDeleted);
  t.false(entry.isExistent);
  t.true(entry.isEmpty);
  t.deepEqual(JSON.parse(JSON.stringify(entry)), {
    name: "somewhere",
    isBlob: true,
    isCollection: false
  });
  t.is(await entry.string, "");
  t.is((await entry.buffer).length, 0);
  t.is((await streamToUint8Array(await entry.readStream)).length, 0);
});
