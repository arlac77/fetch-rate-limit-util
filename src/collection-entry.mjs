import { BaseEntry } from "./base-entry.mjs";

/**
 * Brings directory attributes to entries.
 */
export class CollectionEntry extends BaseEntry {
  /**
   * @return {boolean} always true
   */
  get isCollection() {
    return true;
  }

  /**
   * UTI
   * @return {string[]} "public.directory"
   */
  get types() {
    return ["public.directory"];
  }

  /**
   * Default unix mode for directories.
   * @return {number} 0755
   */
  get mode() {
    return 0o755;
  }
}
