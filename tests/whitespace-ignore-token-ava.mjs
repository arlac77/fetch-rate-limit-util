import test from "ava";
import { WhitespaceIgnoreToken } from "../src/whitespace-ignore-token.mjs";
import { StringChunk } from "../src/string-chunk.mjs";

test("whitespace token", t => {
  const chunk = new StringChunk(" \n\t ");
  const token = WhitespaceIgnoreToken.parse(chunk);
  t.is(token, undefined);

  t.is(chunk.currentLine, 2);
  t.is(chunk.position, 3);
});
