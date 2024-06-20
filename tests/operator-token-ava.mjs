import test from "ava";
import { makeOperatorTokens } from "../src/operator-token.mjs";
import { StringChunk } from "../src/string-chunk.mjs";

test("operator token", t => {
  const chunk = new StringChunk("=");

  const T = makeOperatorTokens({
    "=": {}
  })[0];

  t.is(T.minLength, 1);
  t.is(T.maxLength, 1);

  const token = T.parse(chunk);

  t.is(token.value, "=");
  t.is(chunk.currentLine, 1);
});

test("operator token over several chunks", t => {
  const T = makeOperatorTokens({
    "==": {}
  })[0];

  const chunk = new StringChunk("=");

  //let token = T.parse(chunk);
  //t.is(token, undefined);
  chunk.append("= ");
  let token = T.parse(chunk);
  t.is(token.value, "==");
  t.is(chunk.currentLine, 1);
});
