import test from "ava";

import { getHeaderLink } from "fetch-link-util";

function dlt(t, header, rel, expected) {
  const headers = { get: name => (name === "link" ? header : null) };
  t.is(getHeaderLink(headers, rel), expected);
}

dlt.title = (providedTitle, header, rel, expected) =>
  `decodeLink ${header} ${rel}`.trim();

test(
  dlt,
  `<https://api.github.com/repositories/253911783/pulls?page=1&state=OPEN&head=arlac77%3Apr-test%2Fsource-1>; rel="prev", <https://api.github.com/repositories/253911783/pulls?page=1&state=OPEN&head=arlac77%3Apr-test%2Fsource-1>; rel="last", <https://api.github.com/repositories/253911783/pulls?page=1&state=OPEN&head=arlac77%3Apr-test%2Fsource-1>; rel="first"`,
  "first",
  "https://api.github.com/repositories/253911783/pulls?page=1&state=OPEN&head=arlac77%3Apr-test%2Fsource-1"
);

test(dlt, undefined, undefined);
test(dlt, null, undefined);
test(dlt, '<http://somewhere>; rel="abc"', undefined);
test(dlt, '<http://somewhere>; rel=abc', "abc", undefined);
test(dlt, '<http://somewhere>; rel=".$^"', ".$^", "http://somewhere");
test(dlt, '<http://somewhere>; rel="with spaces"', "with spaces", "http://somewhere");
test(dlt, '<http://somewhere?a=1>; rel="abc"', "abc", "http://somewhere?a=1");
test(dlt, '<http://somewhere?a=1&b=2>; rel="abc"', "abc", "http://somewhere?a=1&b=2");
