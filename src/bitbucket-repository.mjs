import { replaceWithOneTimeExecutionMethod } from "one-time-execution-method";
import {
  Repository,
  RepositoryOwner,
  uuid_attribute,
  size_attribute,
  language_attribute,
  default_attribute
} from "repository-provider";
import { BitbucketBranch } from "./bitbucket-branch.mjs";

/**
 * a repository hosted on bitbucket
 * @param {RepositoryOwner} owner
 * @param {string} name
 * @param {Object} options
 * @param {string} [options.api]
 * @param {string} [options.group]
 *
 * @property {string} api
 * @property {string} group
 * @property {string} user
 */
export class BitbucketRepository extends Repository {
  static get attributes() {
    return {
      ...super.attributes,
      uuid: uuid_attribute,
      size_attribute,
      language_attribute,
      fork_policy: { ...default_attribute, default: "allow_forks" }
    };
  }

  static get attributMapping() {
    return {
      ...super.attributeMapping,
      is_private: "isPrivate",
      website: "homePageURL"
    };
  }

  get user() {
    return this.name.split(/\//)[0];
  }

  /**
   * Deliver the url of home page.
   * @return {string} '.../overwiew'
   */
  get homePageURL() {
    return `${this.provider.url}/${this.slug}/overview`;
  }

  /**
   * Deliver the url of issue tracking system.
   * @return {string} '.../issues'
   */
  get issuesURL() {
    return `${this.provider.url}/${this.slug}/issues`;
  }

  get api() {
    return `repositories/${this.slug}`;
  }

  /**
   * @see https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/#api-repositories-workspace-repo-slug-put
   */
  async update() {
    return this.provider.fetch(this.api, {
      method: "PUT",
      body: JSON.stringify(
        mapAttributesInverse(
          optionJSON(this, undefined, this.constructor.writableAttributes),
          this.constructor.attributeMapping
        )
      )
    });
  }

  /**
   * @see https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/#api-repositories-workspace-repo-slug-hooks-get
   */
  async initializeHooks() {
    let url = `${this.api}/hooks`;

    do {
      const { json } = await this.provider.fetchJSON(url);
      json.values.forEach(h => this.addHook(h.uuid, h));
      url = json.next;
    } while (url);
  }

  /**
   * {@link https://developer.atlassian.com/cloud/bitbucket/rest/api-group-refs/#api-group-refs}
   */
  async initializeBranches() {
    let url = `${this.api}/refs/branches`;

    do {
      const { json } = await this.provider.fetchJSON(url);

      if (json.type === "error") {
        break;
      }

      json.values.forEach(b => this.addBranch(b.name, b.target));

      url = json.next;
    } while (url);
  }

  /**
   * Create a new branch
   * {@link https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D/refs/branches?_ga=2.65542446.1034690805.1541022941-164225451.1541022941#post}
   * @param {string} name of the new branch to create
   * @param {BitbucketBranch} from
   * @param {Object} options
   * @param {string} [options.message]
   */
  async createBranch(name, from = this.defaultBranch, options) {
    const branch = await super.branch(name);

    if (branch) {
      return branch;
    }

    from = await from;

    await from.initialize();

    const { json } = await this.provider.fetchJSON(
      `${this.api}/refs/branches`,
      {
        method: "POST",
        data: {
          name,
          target: {
            hash: from.hash
          }
        }
      }
    );

    return super.addBranch(name, json);
  }

  /**
   * {@link https://docs.atlassian.com/bitbucket-server/rest/5.8.0/bitbucket-branch-rest.html#idm45555984542992}
   * {@link https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D/refs/branches/%7Bname%7D#delete}
   */
  async deleteBranch(name) {
    const response = await this.provider.fetch(
      `${this.api}/refs/branches/${name}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return super.deleteBranch(name);
  }
}

replaceWithOneTimeExecutionMethod(
  BitbucketRepository.prototype,
  "initializeBranches"
);
replaceWithOneTimeExecutionMethod(
  BitbucketRepository.prototype,
  "initializeHooks"
);
replaceWithOneTimeExecutionMethod(
  BitbucketRepository.prototype,
  "initializePullRequests"
);
