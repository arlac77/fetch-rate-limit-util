import { BufferContentEntryMixin } from "./buffer-content-entry-mixin.mjs";
import { ContentEntry } from "./content-entry.mjs";

/**
 * ConentEntry with a Uint8Array as content store.
 * @param {string} name
 * @param {Uint8Array} buffer
 */
export class BufferContentEntry extends BufferContentEntryMixin(ContentEntry) {
  constructor(name, buffer) {
    // @ts-ignore
    super(name);
    Object.defineProperties(this, { buffer: { value: buffer } });
  }
}
