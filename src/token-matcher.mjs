/**
 * Holds a Set of tokens and identifies them based on the longest matching character string
 * @param {Token[]} tokens
 *
 * @property {Token[]} tokens
 * @property {Map<string,Token>} registeredTokens
 * @property {Map<Char,number>} maxTokenLengthForFirstChar
 *
 */
export class TokenMatcher {
  constructor(tokens) {
    Object.defineProperties(this, {
      tokens: { value: tokens },
      maxTokenLengthForFirstChar: {
        value: new Map()
      },
      registeredTokens: {
        value: new Map()
      }
    });

    for (const t of tokens) {
      t.register(this);
    }
  }

  registerToken(key, token) {
    const firstChar = key[0];
    const maxLength = this.maxTokenLengthForFirstChar.get(firstChar) || 0;

    if (maxLength < key.length) {
      this.maxTokenLengthForFirstChar.set(firstChar, key.length);
    }

    this.registeredTokens.set(key, token);
  }
}
