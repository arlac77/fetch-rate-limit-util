import test from "ava";
import { stateActionHandler } from "fetch-rate-limit-util";

test("api.github.com", async t => {
  const res = await stateActionHandler(fetch, "https://api.github.com/", {});
  t.true(res.ok);
});
