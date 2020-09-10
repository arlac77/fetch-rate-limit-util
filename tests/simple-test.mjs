import test from "ava";

import { rateLimitHandler } from "fetch-rate-limit-util";

async function rlt(t, headers, status = 403, expected) {
  const response = {
    url: "http://somewhere.com/",
    status,
    headers: { get: name => headers[name] }
  };
  let msecs = -1;

  await rateLimitHandler(
    async () => response,
    x => {
      msecs = x;
      return msecs;
    }
  );
  t.is(msecs, expected);
}

rlt.title = (providedTitle, headers, status = 403, expected) =>
  `rate limit ${JSON.stringify(headers)} ${status}`.trim();

test(
  rlt,
  {
    "x-ratelimit-remaining": 100,
    "x-ratelimit-reset": Date.now() + 1000
  },
  403,
  1000
);
