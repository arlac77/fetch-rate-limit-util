import { matcher } from "matching-iterator";
import { Branch } from "repository-provider";
import {
  ContentEntry,
  BufferContentEntry,
  BufferContentEntryMixin,
  CollectionEntry
} from "content-entry";

/**
 * Branch of a bitbucket repository.
 */
export class BitbucketBranch extends Branch {
  /**
   * options
   */
  static get attributes() {
    return {
      ...super.attributes,
      /**
       *
       * @return {string}
       */
      hash: { type: "string" }
    };
  }

  // TODO isInitialized ?

  async initialize() {
    if (this.hash === undefined) {
      const url = `repositories/${this.slug}/refs/branches?q=name="${this.name}"`;
      const { json } = await this.provider.fetchJSON(url);

      if (!Array.isArray(json.values) || json.values.length != 1) {
        console.log(json);
        throw new Error(`No such branch ${this.name}`);
      }

      this.hash = json.values[0].target.hash;

      //delete json.values[0].target.repository;
      //Object.assign(this,json.values[0].target);
    }
  }

  /**
   * {@link https://developer.atlassian.com/bitbucket/api/2/reference/resource/repositories/%7Busername%7D/%7Brepo_slug%7D/src/%7Bnode%7D/%7Bpath%7D}
   * @param {string} name
   * @return {Promise<ContentEntry>}
   */
  async entry(name) {
    await this.initialize();

    const res = await this.provider.fetch(
      `repositories/${this.slug}/src/${this.hash}/${name}`
    );
    if (res.ok) {
      return new this.entryClass(name, Buffer.from(await res.arrayBuffer()));
    }
  }

  /**
   *
   * @param {string[]|string} patterns
   */
  async *entries(patterns) {
    await this.initialize();

    const { json } = await this.provider.fetchJSON(
      `repositories/${this.slug}/src/${this.hash}/?max_depth=99`
    );

    for (const entry of matcher(json.values, patterns, { name: "path" })) {
      yield entry.type === "commit_directory"
        ? new CollectionEntry(entry.path)
        : new LazyBufferContentEntry(entry.path, this);
    }
  }

  /**
   * Commit entries
   * @param {string} message commit message
   * @param {ContentEntry[]} updates content to be commited
   * @param {Object} [options]
   * @return {Promise}
   */
  async commit(message, updates, options) {
    const searchParams = new URLSearchParams();
    searchParams.set("message", message);
    searchParams.set("branch", this.name);
    //searchParams.set("parents", XXX);

    for (const u of updates) {
      searchParams.set(u.name, await u.string);
    }

    return this.provider.fetch(`repositories/${this.slug}/src`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: searchParams
    });
  }

  get entryClass() {
    return BufferContentEntry;
  }
}

class LazyBufferContentEntry extends BufferContentEntryMixin(ContentEntry) {
  constructor(name, branch) {
    super(name);
    Object.defineProperties(this, {
      branch: { value: branch }
    });
  }

  get buffer() {
    return this._buffer();
  }

  async _buffer() {
    const branch = this.branch;

    const res = await branch.provider.fetch(
      `repositories/${branch.slug}/src/${branch.hash}/${this.name}`
    );

    //return new Uint8Array(await res.arrayBuffer());
    return Buffer.from(await res.arrayBuffer());
  }
}
