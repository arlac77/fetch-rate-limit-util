import { Token } from "./token.mjs";

/**
 * Token representing EOF
 */
export class EOFToken extends Token {
  get type() {
    return "eof";
  }
}
