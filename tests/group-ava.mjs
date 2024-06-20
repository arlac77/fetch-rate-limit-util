import test from "ava";
import {
  groupListTest,
  createMessageDestination
} from "repository-provider-test-support";
import BitbucketProvider from "bitbucket-repository-provider";

const messageDestination = createMessageDestination().messageDestination;

const provider = BitbucketProvider.initialize(
  { messageDestination },
  process.env
);

test("groups by short name", async t => {
  const group = await provider.repositoryGroup("xhubio");

  t.is(group.name, "xhubio");
  t.is(group.type, "team");
  t.is(group.displayName, "xhubio");
});

const arlac77Group = {
  arlac77: { displayName: "arlac77", type: "user" }
};

const xhubioGroup = {
  xhubio: { displayName: "xhubio", type: "team" }
};

const allGroups = {
  ...arlac77Group,
  ...xhubioGroup
};

test(groupListTest, provider, undefined, allGroups);
test(groupListTest, provider, "*", allGroups);
test(groupListTest, provider, "bitbucket:*", allGroups);
test(groupListTest, provider, "other:*", 0);
test(groupListTest, provider, "arlac77", arlac77Group);
test(groupListTest, provider, "https://bitbucket.org/*", arlac77Group);
test(groupListTest, provider, "https://arlac77@bitbucket.org/*", arlac77Group);
