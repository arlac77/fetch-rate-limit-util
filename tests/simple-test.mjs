import test from "ava";

import { rateLimitHandler } from "fetch-rate-limit-util";

async function rlt(t, headers, status = 403, expected) {
  const response = {
    status,
    headers: { get: name => headers[name] }
  };

  if (expected === -1) {
    t.plan(0);
  }

  await rateLimitHandler(
    async () => response,
    (millisecondsToWait, rateLimitRemaining, nthTry) => {
      console.log(millisecondsToWait, rateLimitRemaining, nthTry);

      t.true(millisecondsToWait > 0 && millisecondsToWait <= expected);

      response.status = 200;
      return millisecondsToWait;
    }
  );
}

rlt.title = (providedTitle, headers, status = 403, expected) =>
  `rate limit ${JSON.stringify(headers)} ${status}`.trim();

test(rlt, {}, 200, -1);

test(
  rlt,
  {
    "x-ratelimit-reset": Date.now() / 1000 + 1
  },
  403,
  1000
);

test(
  rlt,
  {
    "x-ratelimit-reset": Date.now() / 1000 + 1
  },
  429,
  1000
);

test.skip(
  rlt,
  {
    "x-ratelimit-remaining": 10
  },
  403,
  1000
);
