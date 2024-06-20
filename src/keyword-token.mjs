import { Token } from "./token.mjs";

/**
 *
 */
export class KeywordToken extends Token {
  static register(tokenizer) {
    tokenizer.registerToken(this.value, this);
  }

  static parse(chunk) {
    chunk.advanceBy(this.value.length);
    return new this();
  }

  get type() {
    return "keyword";
  }

  get value() {
    return this.constructor.value;
  }
}

/**
 * Creates a new token class for each token definition.
 * @param {Object} tokenDefinitions keys are the operator names
 * @param {KeywordToken} baseToken
 * @return {KeywordToken []} newly created KeywordToken classes
 */
export function makeKeywordTokens(tokenDefinitions, baseToken = KeywordToken) {
  const tokens = [];

  Object.keys(tokenDefinitions).forEach(key => {
    tokens.push(
      class GeneratedKeywordToken extends baseToken {
        static get value() {
          return key;
        }
        static get minLength() {
          return key.length;
        }
        static get maxLength() {
          return key.length;
        }
      }
    );
  });

  return tokens;
}
