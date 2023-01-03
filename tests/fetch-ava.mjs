import test from "ava";
import { stateActionHandler } from "fetch-rate-limit-util";

test("api.github.com", async t => {
  
  if(!globalThis.fetch) {
  	const module = await import("node-fetch");
  	globalThis.fetch = module.default;
  }

  const res = await stateActionHandler(fetch, "https://api.github.com/", {});
  t.true(res.ok);
});
