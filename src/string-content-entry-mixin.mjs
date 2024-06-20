import { stringToStream } from "browser-stream-util";
import { ContentEntry } from "./content-entry.mjs";

/**
 * Content entries where a string is the primary data representation.
 * @param {new (name: string) => ContentEntry } superclass
 */
export function StringContentEntryMixin(superclass) {

  return class StringContentEntryMixin extends superclass {
    /**
     * @return {Uint8Array}
     */
    get buffer() {
      const encoder = new TextEncoder(/*this.encoding*/);
      // @ts-ignore
      return encoder.encode(this.string);
    }

    /**
     * @return {Number} size in bytes
     */
    get size() {
      return this.buffer.length;
    }

    /**
     * Deliver content as read stream
     * @return {ReadableStream} content
     */
    get readStream() {
      // @ts-ignore
      return stringToStream(this.string);
    }

    /**
     * @deprecated
     */
    async getReadStream() {
      // @ts-ignore
      return stringToStream(this.string);
    }
  };
}
