import test from "ava";
import { pullRequestLivecycle, pullRequestList, BITBUCKET_REPOSITORY_NAME, createMessageDestination } from "repository-provider-test-support";
import BitbucketProvider from "bitbucket-repository-provider";

const messageDestination = createMessageDestination().messageDestination;
//messageDestination.trace = console.log;

test("pr livecycle", async t => {
  await pullRequestLivecycle(
    t,
    BitbucketProvider.initialize({ messageDestination }, process.env),
    BITBUCKET_REPOSITORY_NAME
  );
});

test("pr list", async t => {
  await pullRequestList(
    t,
    BitbucketProvider.initialize({ messageDestination }, process.env),
    BITBUCKET_REPOSITORY_NAME
  );
});
