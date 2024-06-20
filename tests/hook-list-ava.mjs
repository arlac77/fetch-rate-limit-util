import test from "ava";
import { createMessageDestination, REPOSITORY_NAME } from "repository-provider-test-support";
import BitbucketProvider from "bitbucket-repository-provider";

const messageDestination = createMessageDestination().messageDestination;
//messageDestination.trace= console.log;
const provider = BitbucketProvider.initialize({ messageDestination }, process.env);

test("hooks list", async t => {
  const repository = await provider.repository(REPOSITORY_NAME);

  const hooks = [];

  for await (const hook of repository.hooks()) {
    hooks.push(hook);
  }

  const hook = hooks.find(h => h.url === "https://deepscan.io/api/webhook/github");

  t.deepEqual(
    hook.events,
    new Set([
      "repo:push"
    ])
  );
  t.is(hook.content_type, "json");
  t.is(hook.url, "https://deepscan.io/api/webhook/github");
  t.true(hook.active);
  //t.is(hook.description, "web");

  t.deepEqual(hook.toJSON(), {
    description: "web",
    active: true,
    events: [
      "repo:push"
    ],
    id: '{a1c29afb-fa25-4343-976c-55d2eaabb758}',
    name: '{a1c29afb-fa25-4343-976c-55d2eaabb758}',
    insecure_ssl: false,
  //  secret: "********",
    content_type: "json",
    url: "https://deepscan.io/api/webhook/github"
  });
});
