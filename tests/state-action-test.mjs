import test from "ava";
import { stateActionHandler } from "fetch-rate-limit-util";

async function sat(t, responses, expected) {
  const response = await stateActionHandler(
    async function (url, options) {
      const r = responses.shift();

      const response = {
        url,
        headers: { get: name => r.headers[name] },
        status: r.status
      };
      return response;
    },
    "http://somewhere/",
    {},
    undefined,
    () => {}
  );

  t.is(response.status, expected);
}

sat.title = (providedTitle, headers, nthRetry, expected) =>
  `state action ${JSON.stringify(headers)} ${nthRetry}`.trim();

test(sat, [{ status: 200 }], 200);
test(sat, [{ status: 500 }, { status: 500 }, { status: 500 }], 500);
test.skip(
  sat,
  [
    {
      status: 429,
      headers: { "x-ratelimit-reset": Date.now() / 1000 + 1}
    },
    { status: 200 }
  ],
  200
);
