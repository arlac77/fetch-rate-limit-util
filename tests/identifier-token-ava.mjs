import test from 'ava';
import { IdentifierToken } from '../src/identifier-token.mjs';
import { StringChunk } from '../src/string-chunk.mjs';

test('identifier token parse fitting chunk', t => {
  const chunk = new StringChunk('abc ');
  const token = IdentifierToken.parse(chunk);
  t.is(token.value, 'abc');
});

test('identifier token parse from several chunks', t => {
  const chunk = new StringChunk('abc');
  let token;
  token = IdentifierToken.parse(chunk);
  t.is(token, undefined);
  chunk.append('d');
  token = IdentifierToken.parse(chunk);
  t.is(token, undefined);
  chunk.append('ef ');
  token = IdentifierToken.parse(chunk);
  t.is(token.value, 'abcdef');
});

test('identifier token parse from several chunks EOF', t => {
  const chunk = new StringChunk('abc');
  let token;
  token = IdentifierToken.parse(chunk);
  t.is(token, undefined);
  chunk.appendLast('def');
  token = IdentifierToken.parse(chunk);
  t.is(token.value, 'abcdef');
});
