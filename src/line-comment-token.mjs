import { Token } from "./token.mjs";

/**
 * Token to skip until end of line
 */
export class LineCommentIgnoreToken extends Token {
  static parse(chunk) {
    while (true) {
      const c = chunk.advance();
      if (c >= 0) {
        if (c === 10) {
          chunk.lineEndReached();
          return undefined;
        }
      } else {
        return undefined;
      }
    }
    return undefined;
  }

  get type() {
    return "comment";
  }
}

/**
 * @param {string} prefix
 * @param {Class} baseToken
 */
export function makeLineCommentToken(
  prefix,
  baseToken = LineCommentIgnoreToken
) {
  const possibleFirstChars = new Set([prefix.charCodeAt(0)]);

  return class LineCommentToken extends baseToken {
    static get minLength() {
      return prefix.length;
    }

    static get possibleFirstChars() {
      return possibleFirstChars;
    }
  };
}
