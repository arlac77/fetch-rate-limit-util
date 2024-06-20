import test from "ava";
import { createProvider } from "./helpers/util.mjs"; 
import { tagListTest } from "repository-provider-test-support";

const provider = createProvider();

test(tagListTest, provider, "bad-name/unknown-*");
