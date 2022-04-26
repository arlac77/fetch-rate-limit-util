import test from "ava";
import { rateLimitHandler } from "fetch-rate-limit-util";

async function rlt(t, headers, nthRetry, expected) {
  const response = {
    headers: { get: name => headers[name] }
  };

  if (typeof expected === "function") {
    t.true(expected(rateLimitHandler(response, nthRetry)));
  } else {
    t.deepEqual(expected, rateLimitHandler(response, nthRetry));
  }
}

rlt.title = (providedTitle, headers, nthRetry, expected) =>
  `rate limit ${JSON.stringify(headers)} ${nthRetry}`.trim();

//test(rlt, {}, 1, { repeatAfter: 1000, message: "Rate limit reached: waiting for 1s" });
test(rlt, {}, 6, { postprocess: true });
test(rlt, { "x-ratelimit-reset": "abc" }, 1, {
  postprocess: false,
  repeatAfter: 1000,
  message: "Rate limit reached: waiting for 1s"
});
test(rlt, { "retry-after": "5" }, 1, {
  postprocess: false,
  repeatAfter: 5000,
  message: "Rate limit reached: waiting for 5s"
});

test(
  rlt,
  {
    "x-ratelimit-reset": Date.now() / 1000 + 1
  },
  1,
  {
    postprocess: false,
    repeatAfter: 1000,
    message: "Rate limit reached: waiting for 1s"
  }
);

/*
X-RateLimit-Used: 5000
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 0
*/
