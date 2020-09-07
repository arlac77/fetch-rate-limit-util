import test from "ava";

import { rateLimitHandler } from "fetch-rate-limit-util";

function rlt(t, headers, expected) {
  const h = { get: name => (name === "link" ? header : null) };
  t.is(getHeaderLink(headers, rel), expected);
}

rlt.title = (providedTitle, headers, expected) =>
  `rate limit ${header} ${rel}`.trim();

test(rlt, `<http://somewhere>; rel="abc"`, undefined);
