import test from "ava";
import { stateActionHandler } from "fetch-rate-limit-util";

async function sat(t, request, responses, expected) {
  const response = await stateActionHandler(
    async function (url, options) {
      const r = responses.shift() || { status: 500 };

      const response = {
        url,
        headers: { get: name => r.headers[name] },
        status: r.status
      };
      return response;
    },
    request.url,
    { ...request.options },
    undefined
    //  () => {}
  );

  t.is(response.status, expected.status);

  if (expected.url) {
    t.is(response.url, expected.url);
  }
}
sat.title = (providedTitle = "state action", request, responses, expected) =>
  `${providedTitle} ${JSON.stringify(request)} ${JSON.stringify(
    responses
  )} ${JSON.stringify(expected)}`.trim();

const REQUEST = { url: "http://somewhere/" };

test(sat, REQUEST, [{ status: 200 }], { status: 200 });
test(
  sat,
  REQUEST,
  [
    { status: 301, headers: { location: "https://new.domain/" } },
    { status: 200 }
  ],
  {
    status: 200,
    url: "https://new.domain/"
  }
);

test(sat, REQUEST, [{ status: 500 }, { status: 500 }, { status: 500 }], {
  status: 500
});
test(
  sat,
  REQUEST,
  [
    {
      status: 429,
      headers: { "x-ratelimit-reset": Date.now() / 1000 + 0.1 }
    },
    { status: 200 }
  ],
  { status: 200 }
);
