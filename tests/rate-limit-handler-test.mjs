import test from "ava";
import { rateLimit } from "fetch-rate-limit-util";

async function rlt(t, headers, nthRetry, expected) {
  const response = {
    headers: { get: name => headers[name] }
  };

  if (typeof expected === "function") {
    t.true(expected(rateLimit(response, nthRetry)));
  } else {
    t.deepEqual(expected, rateLimit(response, nthRetry));
  }
}

rlt.title = (providedTitle, headers, nthRetry, expected) =>
  `rate limit ${JSON.stringify(headers)} ${nthRetry}`.trim();

test(rlt, {}, 1, { repeatAfter: 10000 });
test(rlt, {}, 6, { retries: 0 });
test(rlt, { "x-ratelimit-reset": "abc" }, 1, { repeatAfter: 10000 });

test(
  rlt,
  {
    "x-ratelimit-reset": Date.now() / 1000 + 1
  },
  1,
  expected => expected.repeatAfter > 10000
);

/*
X-RateLimit-Used: 5000
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 0
*/
