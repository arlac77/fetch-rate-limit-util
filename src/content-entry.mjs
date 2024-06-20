import { emptyStream } from "browser-stream-util";
import { BaseEntry } from "./base-entry.mjs";
import { equalsUint8Arrays } from "./util.mjs";

/**
 * General content access entries.
 */
export class ContentEntry extends BaseEntry {
  /**
   * @return {boolean} true
   */
  get isBlob() {
    return true;
  }

  /**
   * UTI types for this entry.
   * defaults to "public.content".
   * @return {string[]}
   */
  get types() {
    return ["public.content"];
  }

  /**
   * By default an zero length stream.
   * @return {ReadableStream}
   */
  get readStream() {
    return emptyStream();
  }

  /**
   * return {Uint8Array}
   */
  get buffer() {
    return Uint8Array.of();
  }

  /**
   * By default an zero length string.
   * @return {string}
   */
  get string() {
    return "";
  }

  /**
   * @return {boolean} true if there is no content (length := 0).
   */
  get isEmpty() {
    return this.buffer.length === 0;
  }

  /**
   * @return {number} size in bytes
   */
  get size() {
    return this.buffer.length;
  }

  /**
   * The default encoding used to convert content to strings.
   * @return {string}
   */
  get encoding() {
    return "utf8";
  }

  /**
   * Compare content against other entry.
   * @param {ContentEntry} other
   * @return {Promise<boolean>} true if other has the same content (bitwise)
   */
  async equalsContent(other) {
    if (other === undefined) {
      return false;
    }

    const [a, b] = await Promise.all([this.buffer, other.buffer]);

    if (a === undefined) {
      return b === undefined;
    }

    return equalsUint8Arrays(a, b);
  }

  /**
   * @deprecated
   */
  async getReadStream() {
    return this.readStream;
  }
}
