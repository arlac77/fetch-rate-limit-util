import test from "ava";
import { Writable } from "node:stream";
import { ContentEntry, StreamContentEntryMixin } from "content-entry";

class AlwaysFailingTestWritable extends Writable {
  _write(chunk, encoding, callback) {
    callback(new Error("write failed"));
  }
}

class TestWritable extends Writable {
  chunks = [];

  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    callback(undefined);
  }
}

class TestEntry extends StreamContentEntryMixin(ContentEntry) {
  async getWriteStream(options) {
    return (this._stream =
      this.name === "write_failure"
        ? new AlwaysFailingTestWritable()
        : new TestWritable());
  }

  get writtenChunks() {
    return this._stream.chunks;
  }
}

test("buffer write", async t => {
  const entry = new TestEntry("writing");
  const buf = Buffer.from("abc");
  await entry.setBuffer(buf);
  t.deepEqual(entry.writtenChunks, [buf]);
});

test("string write", async t => {
  const entry = new TestEntry("writing");
  const str = "abc";
  await entry.setString(str);
  t.deepEqual(entry.writtenChunks, [Buffer.from(str)]);
});

test("string write failure", async t => {
  const entry = new TestEntry("write_failure");
  await t.throwsAsync(
    async () => {
      return entry.setString("XXX");
    },
    { instanceOf: Error, message: "write failed" }
  );
});

test("buffer write failure", async t => {
  const entry = new TestEntry("write_failure");
  await t.throwsAsync(
    async () => {
      return entry.setBuffer(Buffer.from("abc"));
    },
    { instanceOf: Error, message: "write failed" }
  );
});
