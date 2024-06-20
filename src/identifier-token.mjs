import { Token } from "./token.mjs";
import { characterSetFromString } from "./util.mjs";

const firstIdentifierChars = characterSetFromString(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_"
);

const trailingIdentifierChars = characterSetFromString(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_0123456789"
);

export class IdentifierToken extends Token {
  static get maxLength() {
    return 1014;
  }

  static get possibleFirstChars() {
    return firstIdentifierChars;
  }

  static parse(chunk) {
    chunk.markPosition();

    while (true) {
      const c = chunk.peek();
      if (trailingIdentifierChars.has(c)) {
        chunk.advance();
      } else {
        if (c >= 0 || chunk.isLast) {
          return new this(chunk.extractFromMarkedPosition());
        }

        return undefined;
      }
    }
  }

  constructor(value) {
    super();
    Object.defineProperty(this, "value", { value: value });
  }

  get type() {
    return "identifier";
  }
}
