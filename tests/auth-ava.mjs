import test from "ava";
import { promisify } from "util";

import ConsoleAuthProvider from "../src/auth-provider.mjs";

test("provider", async t => {
  const ap = new ConsoleAuthProvider();

  await promisify(setTimeout)(async () => {
    await ap.provideCredentials();
  }, 3000);

  t.true(true);
});
