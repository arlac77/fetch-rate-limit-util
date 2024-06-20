import test from "ava";
import { stringToStream } from "browser-stream-util";
import { ContentEntry, StreamContentEntryMixin } from "content-entry";

class TestEntry extends StreamContentEntryMixin(ContentEntry) {
  async getReadStream(options) {
    return stringToStream("abc");
  }
}

test.skip("string read (chunks)", async t => {
  const entry = new TestEntry("reading");
  t.is(await entry.string, "abc");
});
