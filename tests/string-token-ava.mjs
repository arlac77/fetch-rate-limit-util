import test from "ava";
import { StringToken } from "../src/string-token.mjs";
import { StringChunk } from "../src/string-chunk.mjs";

test("string token", t => {
  const chunk = new StringChunk('"abc"');

  const token = StringToken.parse(chunk);
  t.is(token.value, "abc");
});

test("string token escape", async t => {
  const chunk = new StringChunk('"\\"\\\\\\t"');
  const token = StringToken.parse(chunk);
  t.is(token.value, '"\\\t');
  t.is(chunk.currentLine, 1);
});

test("string token over several chunks", async t => {
  const chunk = new StringChunk('"ab');
  let token = StringToken.parse(chunk);
  t.is(token, undefined);
  chunk.append('cd"');

  token = StringToken.parse(chunk);
  t.is(token.value, "abcd");
  t.is(chunk.currentLine, 1);
});
