import test from "ava";
import { expand } from "config-expander";

test("exec", async t =>
  t.is(await expand("${spawn('echo',['hello'])}"), "hello\n"));
