import test from "ava";
import { DEFAULT_MAX_RETRIES, stateActionHandler } from "fetch-rate-limit-util";

test("undefined response", async t => {

  globalThis.fetch = async (url, options) => { return undefined };

  const res = await stateActionHandler("https://api.github.com/", {});
  t.falsy(res.ok);
});

async function sat(t, request, responses, expected) {
  let iter = 0;
  let usedResponse;

  try {
    const postprocess = async response =>
      request.postprocess ? request.postprocess() : { response };

    globalThis.fetch = async function (url, options) {
      usedResponse = responses[iter] || { status: -1, headers: [] };
      iter++;

      return {
        url,
        headers: {
          get: name => usedResponse.headers && usedResponse.headers[name]
        },
        status: usedResponse.status,
        body: usedResponse.body,
        ok: true
      };
    };
    const { response } = await stateActionHandler(request.url, {
      ...request.options,
      postprocess
    });

    t.truthy(response);

    t.is(response.status, expected.status, "wrong status code");

    if (expected.body) {
      t.is(response.body, expected.body);
    }

    if (expected.url) {
      t.is(response.url, expected.url, "unepected url");
    }
  } catch (e) {
    if (expected?.message) {
      if (expected.message instanceof RegExp) {
        t.regex(
          e.message,
          expected.message,
          `unexpected error message doe not match ${expected.message}`
        );
      } else {
        t.is(e.message, expected.message, "unexpected error message");
      }
    } else {
      throw e;
    }
  }
}
sat.title = (
  providedTitle = "stateActionHandler",
  request,
  responses,
  expected
) =>
  `${providedTitle} ${JSON.stringify(request)} ${responses
    .map(r => `${r.status} ${r.ok ? "ok" : "failed"}`)
    .join(",")} ${JSON.stringify(expected)}`.trim();

const REQUEST = { url: "http://somewhere/" };

test(sat, REQUEST, [{ status: 200, ok: true, body: "a" }], {
  status: 200,
  ok: true,
  body: "a"
});
test(
  sat,
  REQUEST,
  [
    { status: 400, ok: false },
    { status: 400, ok: false },
    { status: 400, ok: false },
    { status: 400, ok: false },
    { status: 400, ok: false },
    { status: 400, ok: false }
  ],
  { status: 400 }
);

test(
  sat,
  REQUEST,
  [
    { status: 500, ok: false },
    { status: 500, ok: false },
    { status: 500, ok: false },
    { status: 500, ok: false },
    { status: 500, ok: false },
    { status: 500, ok: false }
  ],
  new Error(
    `http://somewhere/,GET: Max retry count reached (${DEFAULT_MAX_RETRIES})`
  )
);

test(
  sat,
  {
    ...REQUEST,
    postprocess: async () => {
      throw new Error("Premature close");
    }
  },
  [{ status: 200, ok: true }],
  new Error("Premature close")
);

test(
  "stateActionHandler JSON parse error",
  sat,
  {
    ...REQUEST,
    postprocess: async () => JSON.parse("{ xxx")
  },
  [{ status: 200, ok: true }],
  {
    message:
      /Unexpected token x in JSON at position 2|JSON Parse error|Expected property name|JSON.parse: expected property name/
  }
);

test(
  sat,
  REQUEST,
  [
    { status: 301, ok: true, headers: { location: "https://new.domain/" } },
    { status: 200, ok: true }
  ],
  {
    status: 200,
    url: "https://new.domain/"
  }
);

test.skip(
  sat,
  REQUEST,
  [
    {
      status: 429,
      ok: false,
      headers: { "x-ratelimit-reset": Date.now() / 1000 + 0.1 }
    },
    { status: 200, ok: true, body: "abc7" }
  ],
  { status: 200, ok: true, body: "abc7" }
);
