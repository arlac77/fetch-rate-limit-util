import { Token } from "./token.mjs";
import { characterSetFromString } from "./util.mjs";

const whitespaceChars = characterSetFromString(" \t\n\r");

/**
 * Token to consume all consecutive whitespace
 */
export class WhitespaceIgnoreToken extends Token {
  static get possibleFirstChars() {
    return whitespaceChars;
  }

  static parse(chunk) {
    while (true) {
      const c = chunk.peek();
      if (whitespaceChars.has(c)) {
        if (c === 10) {
          chunk.lineEndReached();
        }
        chunk.advance();
      } else {
        break;
      }
    }

    return undefined;
  }

  get type() {
    return "space";
  }
}
