import test from "ava";

import { TokenMatcher } from "../src/token-matcher.mjs";
import { NumberToken } from "../src/number-token.mjs";
import { StringToken } from "../src/string-token.mjs";
import { makeKeywordTokens } from "../src/keyword-token.mjs";
import { IdentifierToken } from "../src/identifier-token.mjs";
import { makeOperatorTokens, OperatorToken } from "../src/operator-token.mjs";
import { WhitespaceIgnoreToken } from "../src/whitespace-ignore-token.mjs";

test("matcher single token", t => {
  const tm = new TokenMatcher([NumberToken]);

  t.is(tm.maxTokenLengthForFirstChar.get("0".charCodeAt(0)), 1);
  t.is(tm.maxTokenLengthForFirstChar.get("1".charCodeAt(0)), 1);
  t.is(tm.maxTokenLengthForFirstChar.get("2".charCodeAt(0)), 1);
  t.is(tm.maxTokenLengthForFirstChar.get("x".charCodeAt(0)), undefined);
});

test("matcher token list", t => {
  const tm = new TokenMatcher([
    WhitespaceIgnoreToken,
    NumberToken,
    StringToken,
    IdentifierToken,
    ...makeKeywordTokens({ if: {}, else: {}, end: {} }),
    ...makeOperatorTokens(OperatorToken, {
      "=": {
        precedence: 77
      },
      "+": {},
      "-": {},
      "*": {
        precedence: 42
      },
      "/": {},
      "(": {},
      ")": {},
      "[": {},
      "]": {},
      "{": {},
      "}": {},
      ":": {},
      "<": {},
      ">": {},
      ".": {},
      ",": {},
      ";": {},
      "<=": {},
      ">=": {},
      "=>": {},
      "===": {},
      "!===": {}
    })
  ]);
  t.is(tm.maxTokenLengthForFirstChar.get("0".charCodeAt(0)), 1);
  t.is(tm.maxTokenLengthForFirstChar.get("i".charCodeAt(0)), 2);
  t.is(tm.maxTokenLengthForFirstChar.get("e".charCodeAt(0)), 4);
  t.is(tm.maxTokenLengthForFirstChar.get("-".charCodeAt(0)), 1);
  t.is(tm.maxTokenLengthForFirstChar.get("=".charCodeAt(0)), 3);
  t.is(tm.maxTokenLengthForFirstChar.get("!".charCodeAt(0)), 4);
});
