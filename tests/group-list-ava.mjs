import test from "ava";
import { groupListTest } from "repository-provider-test-support";
import { createProvider } from "./helpers/util.mjs"; 

const provider = createProvider();

test(groupListTest, provider, "some_strange_name", undefined, true);

const githubMirror = {
  "gitea/github-mirror": { description: "mirror of github.com" }
};

test(groupListTest, provider, "github-mirror", githubMirror, true);
test(groupListTest, provider, "gitea:github-mirror", githubMirror, true);
test(groupListTest, provider, "gitea:*", githubMirror, true);
test(groupListTest, provider, "gitea:", githubMirror, true);

const all = {
  "github/arlac77": {
    type: "User"
  },
  "bitbucket/arlac77": {
    type: "user"
  },
  "github/Kronos-Integration": {
    type: "Organization"
    // description: "service management with node"
  },
  "gitea/github-mirror": { description: "mirror of github.com" }
};

test(groupListTest, provider, "*", all, true);
test(groupListTest, provider, undefined, all, true);
