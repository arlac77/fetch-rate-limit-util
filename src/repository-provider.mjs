import { matcher } from "matching-iterator";
import { aggregateFifo } from "aggregate-async-iterator";
import {
  MultiGroupProvider,
  RepositoryGroup,
  Repository,
  Branch,
  Tag,
  PullRequest,
  Project,
  Milestone,
  Hook
} from "repository-provider";

/**
 * <!-- skip-example -->
 * Combines several repository providers into one.
 * @param {MultiGroupProvider[]} providers
 * @property {MultiGroupProvider[]} providers
 * @example
 *   const provider = new AggregationProvider([
 *     new GithubProvider(),
 *   new BitbucketProvider()
 * ]);
 *  const repository1 = await provider.repository(
 *    'https://github.com/arlac77/aggregation-repository-provider'
 *  );
 * const repository2 = await provider.repository(
 *  'https://arlac77@bitbucket.org/arlac77/sync-test-repository.git'
 * );
 * // repository1 -> github
 * // repository2 -> bitbucket
 */
export class AggregationProvider extends MultiGroupProvider {
  /**
   * Creates a new provider for a given list of provider factories.
   * Factories can be import urls with additional instance identifier.
   * ```txt
   * IDENTIFIER(my-repository-provider)
   * ```
   * @param {(new()=>MultiGroupProvider)[]|string[]} factories
   * @param {Object} [options] additional options
   * @param {Object} [env] taken from process.env
   * @return {Promise<MultiGroupProvider>} newly created provider
   */
  static async initializeWithProviders(factories = [], options, env) {
    const key = this.instanceIdentifier + "FACTORIES";

    if (env[key]) {
      factories.push(...env[key].split(/\s*,\s*/));
    }

    return new this(
      await Promise.all(
        factories.map(async f => {
          let o = options;

          if (typeof f === "string") {
            const m = f.match(/^(\w+)\(([^\)]+)\)/);
            if (m) {
              f = m[2];
              o = { instanceIdentifier: m[1], ...options };
            }

            f = (await import(f)).default;
          }

          return f.initialize(o, env);
        })
      ),
      options
    );
  }

  static get name() {
    return "aggregation";
  }

  /**
   * @return {string} default instance environment name prefix
   */
  static get instanceIdentifier() {
    return "AGGREGATION_";
  }

  constructor(providers, options) {
    super(options);
    this.setProviders(providers);
  }

  setProviders(providers) {
    this._providers = providers
      .filter(provider => provider !== undefined)
      .sort((a, b) => b.priority - a.priority);

    this._providers.forEach(provider => (provider.messageDestination = this));
  }

  async *providers(name) {
    yield* matcher(this._providers.values(), name, {
      name: "name"
    });
  }

  async lookup(type, name) {
    for (const p of this._providers) {
      const item = await p[type](name);

      if (item !== undefined) {
        return item;
      }
    }
  }

  /**
   * Retrieve named pull request in one of the given providers.
   * They are consulted in the order of the propviders given to the constructor.
   * @param {string} name
   * @return {Promise<PullRequest>}
   */
  async pullRequest(name) {
    return this.lookup("pullRequest", name);
  }

  /**
   * Retrieve named repository in one of the given providers.
   * They are consulted in the order of the propviders given to the constructor.
   * @param {string} name
   * @return {Promise<Repository>}
   */
  async repository(name) {
    return this.lookup("repository", name);
  }

  /**
   * Retrieve named branch in one of the given providers.
   * They are consulted in the order of the propviders given to the constructor.
   * @param {string} name
   * @return {Promise<Branch>}
   */
  async branch(name) {
    return this.lookup("branch", name);
  }

  /**
   * Retrieve named tag in one of the given providers.
   * They are consulted in the order of the propviders given to the constructor.
   * @param {string} name
   * @return {Promise<Tag>}
   */
  async tag(name) {
    return this.lookup("tag", name);
  }

  /**
   * Retrieve named repository group in one of the given providers.
   * They are consulted in the order of the propviders given to the constructor.
   * @param {string} name
   * @return {Promise<RepositoryGroup>}
   */
  async repositoryGroup(name) {
    return this.lookup("repositoryGroup", name);
  }

  /**
   * List repositories groups of the providers.
   * @param {string[]|string} [patterns]
   * @return {AsyncIterable<RepositoryGroup>} all matching repository groups of the providers
   */
  async *repositoryGroups(patterns) {
    // @ts-ignore
    yield* aggregateFifo(
      this._providers.map(p => p.repositoryGroups(patterns))
    );
  }

  /**
   * List provider objects of a given type collected from all providers.
   *
   * @param {string} type name of the method to deliver typed iterator projects,milestones,hooks,repositories,branches,tags
   * @param {string[]|string|undefined} patterns group / repository filter
   * @return {AsyncIterable<Repository|PullRequest|Branch|Tag|Project|Milestone|Hook>} all matching repositories of the providers
   */
  // @ts-ignore
  async *list(type, patterns) {
    // @ts-ignore
    yield* aggregateFifo(this._providers.map(p => p.list(type, patterns)));
  }
}

export default AggregationProvider;
