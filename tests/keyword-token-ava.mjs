import test from "ava";
import { KeywordToken, makeKeywordTokens } from "../src/keyword-token.mjs";
import { StringChunk } from "../src/string-chunk.mjs";

test("keyword token", t => {
  const token = new KeywordToken();
  t.is(token.type, "keyword");
});

test("makeKeywordTokens token", t => {
  const tokens = makeKeywordTokens({ function: {} });

  t.is(tokens.length, 1);

  const kw = tokens[0];
  //t.is(kw.type, "keyword");
  t.is(kw.value, "function");
  t.is(kw.minLength, 8);
  t.is(kw.maxLength, 8);
});

test("keyword token parse", async t => {
  const KWToken = makeKeywordTokens({ function: {} })[0];
  const chunk = new StringChunk("function");
  const token = KWToken.parse(chunk);
  t.is(token.value, "function");
});

test("keyword token several chunks", async t => {
  const KWToken = makeKeywordTokens({ function: {} })[0];
  let token;

  const chunk = new StringChunk("funct");
  //token = KWToken.parse(chunk);
  //t.is(token, undefined);
  chunk.append("ion ");
  token = KWToken.parse(chunk);
  t.is(token.value, "function");
});
