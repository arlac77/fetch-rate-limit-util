import {
  PullRequest,
  Repository,
  Branch,
  boolean_attribute,
  count_attribute,
  default_attribute
} from "repository-provider";

/**
 * Pull request inside bitbucket
 */
export class BitbucketPullRequest extends PullRequest {

  static states = new Set(["OPEN", "MERGED", "SUPERSEDED", "DECLINED"]);
  static mergeStrategies = new Set(["fast_forward", "squash", "merge_commit"]);

  static get attributes() {
    return {
      ...super.attributes,
      state: {
        ...default_attribute,
        values: this.states,
        writeable: true
      },
      close_source_branch: boolean_attribute,
      task_count: count_attribute
    };
  }

  /**
   * List all pull request for a given repo.
   * Result will be filtered by source branch, destination branch and states
   * @param {Repository} repository
   * @param {Object} [filter]
   * @param {Branch} [filter.source]
   * @param {Branch} [filter.destination]
   * @param {Set<string>} [filter.states]
   * @return {AsyncIterable<PullRequest>}
   */
  static async *list(repository, filter) {
    const getBranch = async u =>
      repository.provider.branch(
        [u.repository.full_name, u.branch.name].join("#")
      );

    const query = filter?.states?.size
      ? "?" + [...filter?.states].map(state => `state=${state}`).join("&")
      : "";
    let url = `${repository.api}/pullrequests${query}`;

    do {
      const { json } = await repository.provider.fetchJSON(url);
      url = json.next;

      if (json.values) {
        console.log("N",json.values.length);
        for (const p of json.values) {
          const source = await getBranch(p.source);

          if (filter?.source && !filter.source.equals(source)) {
            continue;
          }

          const destination = await getBranch(p.destination);

          if (filter?.destination && !filter.destination.equals(destination)) {
            continue;
          }

          yield new this(source, destination, p.id, {
            description: p.description,
            title: p.title,
            state: p.state,
            body: p.summary.raw
          });
        }
      }
    } while (url);
  }

  /**
   * {@link https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D/pullrequests#post}
   */
  static async open(source, destination, options) {
    for await (const p of source.provider.pullRequestClass.list(
      source.repository,
      { source, destination }
    )) {
      return p;
    }

    const { response, json } = await destination.provider.fetchJSON(
      `${destination.api}/pullrequests`,
      {
        method: "POST",
        data: {
          source: {
            branch: {
              name: source.name
            }
          },
          destination: {
            branch: {
              name: destination.name
            }
          },
          ...options,
          description: options.body
        }
      }
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    if (json.type === "error" && json.error) {
      throw new Error(json.error.message);
    }

    return new this(source, destination, json.id, {
      body: json.description,
      title: json.title,
      state: json.state
    });
  }

  /**
   * {@link https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Bworkspace%7D/%7Brepo_slug%7D/pullrequests/%7Bpull_request_id%7D/merge}
   */
  async _merge(merge_strategy = "merge_commit") {
    const url = `${this.destination.api}/pullrequests/${this.number}/merge`;
    return this.destination.provider.fetch(url, {
      type: "a type",
      message: "a message",
      method: "POST",
      data: {
        close_source_branch: false,
        merge_strategy
      }
    });
  }

  get url() {
    return `${this.provider.url}/${this.destination.slug}/pull-requests/${this.name}`;
  }
}
