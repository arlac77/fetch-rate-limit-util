import test from "ava";

import { rateLimitHandler } from "fetch-rate-limit-util";

async function rlt(t, headers, status=403, expected) {
  const response = { status, headers: { get: name => headers[name] };
  let msecs = -1;

  await rateLimitHandler(async () => response, (x) => { msecs = x });
  t.is(msecs,expected); 
}

rlt.title = (providedTitle, headers, status=403, expected) =>
  `rate limit ${headers}`.trim();

test(rlt, { "x-ratelimit-remaining" : 100 }, 0.1);
