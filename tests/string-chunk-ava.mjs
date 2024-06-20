import test from "ava";
import { StringChunk } from "../src/string-chunk.mjs";

test("empty chunk", t => {
  const chunk = new StringChunk();
  t.is(chunk.currentLine, 1);
  t.is(chunk.position, 0);
});

test("peek / advance chunk", t => {
  const chunk = new StringChunk("AB");
  t.is(chunk.peek(), 65);
  t.is(chunk.position, 0);
  t.is(chunk.advance(), 65);
  t.is(chunk.position, 1);
  t.is(chunk.peek(), 66);
});

test("append chunk", t => {
  const chunk = new StringChunk();

  const append1 = "1234";
  chunk.append(append1);
  t.is(chunk.position, 0);

  let i = 0;
  for (const c of chunk) {
    t.is(append1.charCodeAt(i), c);
    i++;
  }

  t.is(i, append1.length);

  for (const c of chunk) {
  }

  chunk.append(append1);
  i = 0;
  for (const c of chunk) {
    t.is(append1.charCodeAt(i), c);
    i++;
  }
  t.is(i, append1.length);
});

test("march chunk", t => {
  const chunk = new StringChunk(" 1234 ");
  chunk.advance();
  chunk.markPosition();
  chunk.advance();
  chunk.advance();
  chunk.advance();
  t.is(chunk.extractFromMarkedPosition(), "123");
});

test("chunk show", t => {
  const chunk = new StringChunk("ABCDEF");
  chunk.advance();

  t.is(chunk.show("theFileName"), "theFileName,1: ABCDEF\n                ^");
});
