import test from "ava";
import { NumberToken } from "../src/number-token.mjs";
import { StringChunk } from "../src/string-chunk.mjs";

test("number token parse fitting chunk", t => {
  const chunk = new StringChunk("17 ");
  const token = NumberToken.parse(chunk);
  t.is(token.value, 17);
  t.is(chunk.currentLine, 1);
});

test("number token with fraction", t => {
  const chunk = new StringChunk("17.2 ");
  const token = NumberToken.parse(chunk);
  t.is(token.value, 17.2);
  t.is(chunk.currentLine, 1);
});

test("number token over several chunks", t => {
  const chunk = new StringChunk("17.");
  let token;
  token = NumberToken.parse(chunk);
  t.is(token, undefined);
  chunk.append("2 ");

  token = NumberToken.parse(chunk);

  t.is(token.value, 17.2);
  t.is(chunk.currentLine, 1);
});

test("number token over several chunks EOF", t => {
  const chunk = new StringChunk("17.");
  let token;
  token = NumberToken.parse(chunk);
  t.is(token, undefined);
  chunk.appendLast("2");

  token = NumberToken.parse(chunk);

  t.is(token.value, 17.2);
  t.is(chunk.currentLine, 1);
});
