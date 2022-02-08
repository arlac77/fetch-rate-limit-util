import test from "ava";
import { stateActionHandler } from "fetch-rate-limit-util";

async function sat(t, request, responses, expected) {
  let iter = 0;
  let usedResponse;

  try {
    const response = await stateActionHandler(
      async function (url, options) {
        usedResponse = responses[iter] || { status: -1 };
        iter++;

        return {
          url,
          headers: { get: name => usedResponse.headers[name] },
          status: usedResponse.status,
          ok: true
        };
      },
      request.url,
      { ...request.options },
      async response => {
        if (usedResponse && usedResponse.postProcessingException) {
          throw usedResponse.postProcessingException;
        }

        return response;
      },
      undefined,
      console.log
    );

    t.truthy(response);

    t.is(response.status, expected.status);

    if (expected.url) {
      t.is(response.url, expected.url);
    }
  } catch (e) {
    if (expected && expected.message) {
      t.is(e.message, expected.message);
    } else {
      throw e;
    }
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
    { status: 500 },
    { status: 500 },
    { status: 500 },
    { status: 500 },
    { status: 500 },
    { status: 500 }
  ],
  new Error("http://somewhere/: Max retry count reached")
);

test(
  sat,
  REQUEST,
  [{ postProcessingException: new Error("Premature close"), status: 200 }],
  new Error("Premature close")
);

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

test.skip(sat, REQUEST, [{ status: 500 }, { status: 500 }], {
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
