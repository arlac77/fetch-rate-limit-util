import test from "ava";
import { rateLimitHandler } from "fetch-rate-limit-util";

async function rlt(t, headers, nthRetry, expected) {
  const options = {};
  const response = {
    headers: { get: name => headers[name] },
    ok: true
  };

  if (typeof expected === "function") {
    t.true(expected(rateLimitHandler(options, response, nthRetry)));
  } else {
    const res = rateLimitHandler(options, response, nthRetry);
    delete res.response;

    t.deepEqual(expected, res);
  }
}

rlt.title = (providedTitle, headers, nthRetry, expected) =>
  `rate limit ${JSON.stringify(headers)} ${nthRetry}`.trim();

//test(rlt, {}, 1, { repeatAfter: 1000, message: "Rate limit reached: waiting for 1s" });
test(rlt, {}, 6, { done: true, postprocess: true });
test(rlt, { "x-ratelimit-reset": "abc" }, 1, {
  done: false,
  postprocess: false,
  repeatAfter: 1000,
  message: "Rate limit reached: waiting for 1s"
});

test(rlt, { "retry-after": null }, 1, {
  done: true,
  postprocess: true
});

test(rlt, { "retry-after": undefined }, 1, {
  done: true,
  postprocess: true
});

test(rlt, { "retry-after": "5" }, 1, {
  done: false,
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
    done: false,
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
