import test from "ava";
import { BufferContentEntryMixin, ContentEntry } from "content-entry";

export class TestBufferContentEntry extends BufferContentEntryMixin(
  ContentEntry
) {
  get buffer() {
    return new TextEncoder().encode("abc");
  }
}

test("buffer content entry create", async t => {
  const entry = new TestBufferContentEntry("somewhere");
  t.is(entry.name, "somewhere");
  t.false(entry.isEmpty);
  t.false(entry.isCollection);
  t.true(entry.isBlob);
  t.is(entry.size, 3);
  t.deepEqual(JSON.parse(JSON.stringify(entry)), {
    name: "somewhere",
    isBlob: true,
    isCollection: false
  });
  t.is(await entry.string, "abc");
  t.is((await entry.buffer).length, 3);

  const stream = await entry.readStream;
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  t.is(chunks[0].length, 3);
});

export class FailingBufferContentEntry extends BufferContentEntryMixin(
  ContentEntry
) {
  get buffer() {
    return this.getBuffer();
  }

  async getBuffer() {
    throw new Error("Unable to get buffer");
  }
}

test("buffer isEmpty failes", async t => {
  const entry = new FailingBufferContentEntry("somewhere");

  try {
    await entry.isEmpty;
    t.fail();
  } catch (e) {
    t.is(e.message, "Unable to get buffer");
  }
});
