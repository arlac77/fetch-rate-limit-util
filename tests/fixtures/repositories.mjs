export const repositories = {
  "https://arlac77@bitbucket.org/arlac77/npm-package-template.git": {
    base: "https://bitbucket.org/",
    group: "arlac77",
    repository: "npm-package-template"
  },
  "https://user:pass@bitbucket.org/arlac77/sync-test-repository.git#aBranch": {
    base: "https://bitbucket.org/",
    group: "arlac77",
    repository: "sync-test-repository",
    branch: "aBranch"
  },
  "https://bitbucket.org/arlac77/sync-test-repository.git#aBranch": {
    base: "https://bitbucket.org/",
    group: "arlac77",
    repository: "sync-test-repository",
    branch: "aBranch"
  },
  "https://bitbucket.org/some-owner/some-repo/src/master/C/D": {
    base: "https://bitbucket.org/",
    group: "some-owner",
    repository: "some-repo"
  },
  /*"https://bitbucket.org/some-owner/some-repo/src/master/C/D#b": {
    base: "https://bitbucket.org/",
    group: "some-owner",
    repository: "some-repo",
    branch: "b"
  },*/
  "git@bitbucket.org/arlac77/sync-test-repository.git#aBranch": {
    base: "git@bitbucket.org/",
    group: "arlac77",
    repository: "sync-test-repository",
    branch: "aBranch"
  },
  "git@bitbucket.org/arlac77/sync-test-repository.git": {
    base: "git@bitbucket.org/",
    group: "arlac77",
    repository: "sync-test-repository"
  },
  "git@bitbucket.org:arlac77/sync-test-repository.git": {
    base: "git@bitbucket.org:",
    group: "arlac77",
    repository: "sync-test-repository"
  },
  "git+ssh@bitbucket.org:arlac77/sync-test-repository.git#aBranch": {
    base: "ssh@bitbucket.org:",
    group: "arlac77",
    repository: "sync-test-repository",
    branch: "aBranch"
  },
  "ssh://git@bitbucket.org/arlac77/sync-test-repository.git": {
    base: "ssh://bitbucket.org",
    group: "arlac77",
    repository: "sync-test-repository"
  },
  "git+https://arlac77@bitbucket.org/arlac77/sync-test-repository.git": {
    base: "https://bitbucket.org/",
    group: "arlac77",
    repository: "sync-test-repository"
  },
  "git@bitbucket.org:xhubio/decision-table-data-generator.git": {
    base: "git@bitbucket.org:", // TODO
    group: "xhubio",
    repository: "decision-table-data-generator"
  }
};
