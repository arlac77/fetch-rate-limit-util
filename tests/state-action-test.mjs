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

  t.is(response.status, expected.status);

  if (expected.url) {
    t.is(response.url, expected.url);
  }
}

sat.title = (providedTitle, headers, nthRetry, expected) =>
  `state action ${JSON.stringify(headers)} ${nthRetry}`.trim();

test(sat, [{ status: 200 }], { status: 200 });
test(sat, [{ status: 301, headers: { location: "https://new.domain/" } }], {
  status: 200,
  url: "https://new.domain/"
});

test(sat, [{ status: 500 }, { status: 500 }, { status: 500 }], { status: 500 });
test.skip(
  sat,
  [
    {
      status: 429,
      headers: { "x-ratelimit-reset": Date.now() / 1000 + 1 }
    },
    { status: 200 }
  ],
  { status: 200 }
);
