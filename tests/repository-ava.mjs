import test from "ava";
import {
  assertRepo,
  assertBranch,
  createMessageDestination
} from "repository-provider-test-support";
import {
  BitbucketRepository,
  BitbucketProvider
} from "bitbucket-repository-provider";

const messageDestination = createMessageDestination().messageDestination;

const owner1 = {
  name: "arlac77",
  displayName: "Markus Felten",
  uuid: "{7eeeef8a-17ef-45be-996f-ea51387bc7b9}"
};

const owner2 = {
  name: "xhubio",
  uuid: "{c1b7a81d-dc4b-4dd7-a763-cddcf5aa4be3}"
};

const repoFixtures = {
  "git@mfelten.de/github-repository-provider.git": undefined,
  "http://somewhere.com/index": undefined,
  "https://somewhere.com/index.git": undefined,

  "https://arlac77@bitbucket.org/arlac77/sync-test-repository.git": {
    provider: BitbucketProvider,
    owner: owner1,
    name: "sync-test-repository",
    fullName: "arlac77/sync-test-repository",
    uuid: "{1fbf1cff-a829-473c-bd42-b5bd684868a1}",
    description: "test repository for npm-template-sync @bitbucket",
    branch: "master"
  },
  "ssh://git@bitbucket.org/arlac77/sync-test-repository.git": {
    provider: BitbucketProvider,
    owner: owner1,
    name: "sync-test-repository",
    fullName: "arlac77/sync-test-repository",
    uuid: "{1fbf1cff-a829-473c-bd42-b5bd684868a1}",
    description: "test repository for npm-template-sync @bitbucket",
    branch: "master"
  },
  "git@bitbucket.org:arlac77/sync-test-repository.git": {
    provider: BitbucketProvider,
    owner: owner1,
    name: "sync-test-repository",
    fullName: "arlac77/sync-test-repository",
    uuid: "{1fbf1cff-a829-473c-bd42-b5bd684868a1}",
    description: "test repository for npm-template-sync @bitbucket",
    branch: "master"
  },
  "git@bitbucket.org:xhubio/decision-table-data-generator.git": {
    provider: BitbucketProvider,
    owner: owner2,
    name: "decision-table-data-generator",
    fullName: "xhubio/decision-table-data-generator",
    // description: undefined,
    branch: "master",
    entries: { "package.json": {}, ".jsdoc.json": {} }
  },

  "https://bitbucket.org/arlac77/template-node-app.git": {
    provider: BitbucketProvider,
    name: "template-node-app",
    uuid: "{bec21095-03ca-45ad-8571-b7d611a6dffd}",
    branch: "master"
  },
  "https://arlac77@bitbucket.org/arlac77/template-node-app.git": {
    provider: BitbucketProvider,
    name: "template-node-app",
    fullName: "arlac77/template-node-app",
    uuid: "{bec21095-03ca-45ad-8571-b7d611a6dffd}",
    owner: owner1,
    hooks: [
      {
        id: "{79492efb-32b4-4f69-a469-606b58d2f8b5}",
        active: true,
        url: "https://mfelten.dynv6.net/services/ci/api/bitbucket",
        events: new Set(["repo:push"])
      }
    ],
    branch: "master"
  }
};

test("locate repository several", async t => {
  t.plan(65);

  const provider = BitbucketProvider.initialize(
    { messageDestination },
    process.env
  );

  for (const [name, repositoryFixture] of Object.entries(repoFixtures)) {
    await assertRepo(
      t,
      await provider.repository(name),
      repositoryFixture,
      name
    );
  }
});

test("locate branch several", async t => {
  t.plan(15);

  const provider = BitbucketProvider.initialize(
    { messageDestination },
    process.env
  );

  for (const [name, repositoryFixture] of Object.entries(repoFixtures)) {
    await assertBranch(t, await provider.branch(name), repositoryFixture, name);
  }
});

test("BitbucketRepository constructor", t => {
  const provider = new BitbucketProvider();
  const group = new provider.repositoryGroupClass(provider, "p1");
  const repository = new BitbucketRepository(group, "r1");

  t.is(repository.owner, group);
  t.is(repository.name, "r1");
  t.is(repository.url, "https://bitbucket.org/p1/r1");
});
