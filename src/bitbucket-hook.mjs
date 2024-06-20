import { Hook } from "repository-provider";

/**
 *
 */
export class BitbucketHook extends Hook {
  static get attributeMapping() {
    return {
      uuid: "id"
    };
  }
}
