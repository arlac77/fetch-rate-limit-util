/**
 * Abstract base token
 */
export class Token {
  static get minLength() {
    return 1;
  }

  static get maxLength() {
    return 1;
  }

  static get length() {
    return 0;
  }

  /**
   * Possible first chars
   * @return Set(<Number>) all possible first chars for the token
   */
  static get possibleFirstChars() {
    return new Set();
  }

  /**
   * register the token in the TokenMatcher
   * @param {TokenMatcher} tokenMatcher
   */
  static register(tokenMatcher) {
    for (const c of this.possibleFirstChars) {
      tokenMatcher.maxTokenLengthForFirstChar.set(c, 1);
      tokenMatcher.registeredTokens.set(c, this);
    }
  }

  static parse() {
    return undefined;
  }

  get type() {
    return "unknown";
  }

  get precedence() {
    return 0;
  }

  get value() {
    return undefined;
  }

  get length() {
    return this.constructor.length;
  }

  toString() {
    return `${this.type}: ${this.value} [${this.precedence}]`;
  }

  led(grammar, left) {
    return left;
  }

  nud() {
    return this;
  }

  combine() {
    return 0;
  }
}
