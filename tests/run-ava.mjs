import test from "ava";
import { execa } from "execa";

const main = new URL("../src/config-expander-cli.mjs", import.meta.url)
  .pathname;
const cfg = new URL("fixtures/config.json", import.meta.url).pathname;

test("config-expander -h", async t => {
  const result = await execa("node", [main, "-h"]);
  t.regex(result.stdout, /Usage: config-expander/);
});

test("config-expander", async t => {
  const result = await execa("node", [main, cfg]);
  t.regex(result.stdout, /"a":\s*1/);
});

test("config-expander constant", async t => {
  const result = await execa("node", [main, cfg]);
  t.regex(result.stdout, /"b":\s*77/);
  t.regex(result.stdout, /"c":\s*77/);
});

test("config-expander -d", async t => {
  const result = await execa("node", [main, "-d", "c2=88", cfg]);
  t.regex(result.stdout, /"d":\s*"88"/);
});
