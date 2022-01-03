import test from "ava";
import { stateActionHandler } from "fetch-rate-limit-util";

async function sat(t, responses, expected) {
  const response = await stateActionHandler(
    async function (url, options) {
      const response = {
        url,
        ...responses.shift()
      };
      return response;
    },
    "http://somewhere/",
    {}
  );

  t.is(response.status, expected);
}

sat.title = (providedTitle, headers, nthRetry, expected) =>
  `state action ${JSON.stringify(headers)} ${nthRetry}`.trim();

  test(sat, [{ status: 200 }], 200);
  test(sat, [{ status: 500 }, { status: 500 }, { status: 500 }], 500);
