import test from "ava";
import { rateLimitHandler } from "fetch-rate-limit-util";

async function rlt(t, headers, status = 403, expected) {
  const response = {
    status,
    headers: { get: name => headers[name] }
  };
  const url = "http://somewhere";
  const options = {};

  async function myFetch(url, options) {
    return response;
  }

  if (expected === -1) {
    t.plan(0);
  }

  await rateLimitHandler(
    myFetch,
    url,
    options,
    (millisecondsToWait, rateLimitRemaining, nthTry) => {
      //console.log(millisecondsToWait, rateLimitRemaining, nthTry);

      t.true(millisecondsToWait >= 0 && millisecondsToWait <= expected);

      response.status = 200;
      return millisecondsToWait;
    }
  );
}

rlt.title = (providedTitle, headers, status = 403, expected) =>
  `rate limit ${JSON.stringify(headers)} ${status}`.trim();

test(rlt, {}, 200, -1);
test(rlt, {}, 500, -1);
test(rlt, {}, 403, 0);
test(rlt, { "x-ratelimit-reset": "abc" }, 403, 0);
test(rlt, {}, 429, 0);

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

/*
const headers = Object.fromEntries(
  `Content-Encoding: gzip
Content-Security-Policy: default-src 'none'
Access-Control-Allow-Origin: *
Referrer-Policy: origin-when-cross-origin, strict-origin-when-cross-origin
X-XSS-Protection: 1; mode=block
Date: Mon, 02 Nov 2020 12:29:34 GMT
Vary: Accept-Encoding, Accept, X-Requested-With
Transfer-Encoding: Identity
Access-Control-Expose-Headers: ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Used, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type, Deprecation, Sunset
X-Frame-Options: deny
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff
Server: GitHub.com
Strict-Transport-Security: max-age=31536000; includeSubdomains; preload
Status: 403 Forbidden
X-RateLimit-Reset: 1604320880
X-GitHub-Media-Type: github.v3; format=json
X-RateLimit-Used: 5000
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 0`
    .split(/\n/)
    .map(l => {
      const m = l.match(/(^[^:]+):\s+(.*)/);
      return [m[1], m[2]];
    })
);
*/
