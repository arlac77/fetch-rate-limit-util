import test from "ava";
import {
  LineCommentIgnoreToken,
  makeLineCommentToken
} from "../src/line-comment-token.mjs";
import { StringChunk } from "../src/string-chunk.mjs";

test("line comment token parse", t => {
  const CommentToken = makeLineCommentToken("#");

  const chunk = new StringChunk("# ABCDEF\n ffddfdd");
  const token = LineCommentIgnoreToken.parse(chunk);
  t.is(token, undefined);

  t.is(chunk.currentLine, 2);
  t.is(chunk.position, 9);
});

test("line comment token parse from several chunks", t => {
  const CommentToken = makeLineCommentToken("#");

  let token;
  const chunk = new StringChunk("# ABC");
  token = LineCommentIgnoreToken.parse(chunk);
  t.is(token, undefined);

  chunk.append("DEF\n ffddfdd");
  token = LineCommentIgnoreToken.parse(chunk);

  t.is(token, undefined);
  t.is(chunk.currentLine, 2);
  t.is(chunk.position, 4);
});
