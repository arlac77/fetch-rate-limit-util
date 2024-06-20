import test from "ava";
import { providerParseNameTest } from "repository-provider-test-support";
import { repositories } from "./fixtures/repositories.mjs";
import BitbucketProvider from "bitbucket-repository-provider";

test("factory name", t => t.is(BitbucketProvider.name, "bitbucket"));

test(providerParseNameTest, new BitbucketProvider(), repositories);

test(
  "mydomain",
  providerParseNameTest,
  new BitbucketProvider({
    url: "https://mydomain.org/repos/"
  }),
  {
    "https://arlac77@bitbucket.org/arlac77/sync-test-repository.git": {
      base: "https://bitbucket.org/",
      group: "arlac77",
      repository: "sync-test-repository"
    },
    "git+https://arlac77@mydomain.org/repos/arlac77/sync-test-repository.git": {
      base: "https://mydomain.org/repos/",
      group: "arlac77",
      repository: "sync-test-repository"
    },
    "https://user:pass@mydomain.org/repos/arlac77/sync-test-repository.git#aBranch":
      {
        base: "https://mydomain.org/repos/",
        group: "arlac77",
        repository: "sync-test-repository",
        branch: "aBranch"
      }
  }
);

test(
  "mydomain with port",
  providerParseNameTest,
  new BitbucketProvider({
    url: "https://mydomain.org:8888/repos/"
  }),
  {
    "git+https://mydomain.org:8888/repos/arlac77/sync-test-repository.git": {
      base: "https://mydomain.org:8888/repos/",
      group: "arlac77",
      repository: "sync-test-repository"
    }
  }
);
