import test from "ava";

import { rateLimitHandler } from "fetch-rate-limit-util";

async function rlt(t, headers, status = 403, expected) {
  const response = {
    url: "http://somewhere.com/",
    status,
    headers: { get: name => headers[name] }
  };
  let msecs;

  await rateLimitHandler(
    async () => response,
    (millisecondsToWait, rateLimitRemaining, nthTry) => {
      console.log(millisecondsToWait, rateLimitRemaining, nthTry);
      msecs = millisecondsToWait;

      response.status = 200;
      return msecs;
    }
  );
  t.true(msecs === undefined || (msecs > 0 && msecs <= expected));
}

rlt.title = (providedTitle, headers, status = 403, expected) =>
  `rate limit ${JSON.stringify(headers)} ${status}`.trim();

test(rlt, {}, 200, -1);

test(
  rlt,
  {
    "x-ratelimit-remaining": 100,
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
