import { Token } from "./token.mjs";
import { characterSetFromString } from "./util.mjs";

const firstNumberChars = characterSetFromString("0123456789");

export class NumberToken extends Token {
  static get maxLength() {
    return 64;
  }

  static get possibleFirstChars() {
    return firstNumberChars;
  }

  static parse(chunk) {
    chunk.markPosition();

    while (true) {
      const c = chunk.peek();

      // c === 'e' && c === 'E'

      if (firstNumberChars.has(c) || c === 46 /*  '.' */) {
        chunk.advance();
      } else {
        if (c >= 0 || chunk.isLast) {
          const str = chunk.extractFromMarkedPosition();
          //console.log(str);
          return new this(+str);
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
    return "number";
  }
}
