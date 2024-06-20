import test from "ava";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createReadStream } from "node:fs";
import { BufferContentEntry, ReadableStreamContentEntry } from "content-entry";

const here = dirname(fileURLToPath(import.meta.url));

test("readable stream content entry create", async t => {
  const entry = new ReadableStreamContentEntry(
    "somewhere",
    createReadStream(join(here, "fixtures", "file.txt"), { encoding: "utf8" })
  );
  t.is(entry.name, "somewhere");
  t.false(entry.isCollection);
  t.true(entry.isBlob);
  t.false(entry.isDeleted);
  t.true(entry.isExistent);
  t.is(entry.mode, 0o644);

  t.deepEqual(JSON.parse(JSON.stringify(entry)), {
    name: "somewhere",
    isBlob: true,
    isCollection: false
  });
  t.is(await entry.string, "abc\n");
  t.false(entry.isEmpty); // TODO after reading ?
});

test("readable stream content entry buffer", async t => {
  const entry = new ReadableStreamContentEntry(
    "somewhere",
    createReadStream(join(here, "fixtures", "file.txt"))
  );
  t.is((await entry.buffer).length, 4);
});

test("readable stream content entry equalsContent ReadableStreamContentEntry <> BufferContentEntry", async t => {
  const be = new BufferContentEntry("somewhere", Buffer.from("abc\n"));

  const entry = new ReadableStreamContentEntry(
    "somewhere",
    createReadStream(join(here, "fixtures", "file.txt"))
  );

  t.true(await entry.equalsContent(be));
  //t.true(await be.equalsContent(entry));
});

test("readable stream content entry equalsContent BufferContentEntry <> ReadableStreamContentEntry", async t => {
  const be = new BufferContentEntry("somewhere", Buffer.from("abc\n"));

  const entry = new ReadableStreamContentEntry(
    "somewhere",
    createReadStream(join(here, "fixtures", "file.txt"))
  );

  t.true(await be.equalsContent(entry));
});
