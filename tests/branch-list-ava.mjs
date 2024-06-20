import test from "ava";
import { createProvider } from "./helpers/util.mjs"; 
import { branchListTest } from "repository-provider-test-support";

const provider = createProvider();

test(branchListTest, provider, "mock1/r*", {
  "mock1/repo1": {
    fullCondensedName: "mock1/repo1"
  }
});

test(branchListTest, provider, "bad-name/unknown-*");
test(branchListTest, provider, "arlac77/npm-*", 3);
test(branchListTest, provider, "https://github.com/arlac77/npm-*", 3);
test(
  branchListTest,
  provider,
  "arlac77/*repository-provider",
  {
    "github/arlac77/aggregation-repository-provider": {
      fullCondensedName: "arlac77/aggregation-repository-provider"
    }
  },
  true
);
