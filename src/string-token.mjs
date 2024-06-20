import { Token } from "./token.mjs";
import { characterSetFromString } from "./util.mjs";

const DOUBLE_QUOTE = 34;
const BACKSLASH = 92;
const LOWERCASE_B = 98;
const LOWERCASE_F = 102;
const LOWERCASE_N = 110;
const LOWERCASE_R = 114;
const LOWERCASE_T = 116;

const stringFirstChar = new Set([DOUBLE_QUOTE]);

export class StringToken extends Token {
  static get possibleFirstChars() {
    return stringFirstChar;
  }

  static get minLength() {
    return 2;
  }

  static get maxLength() {
    return 1014;
  }

  /**
0 -> skip leading "
1 -> copy chars
2 -> escape
*/

  static parse(chunk) {
    //console.log(`XX ${chunk.position} ${this.markedPosition} ${chunk.buffer}`);

    const captured = chunk.markPosition({ state: 0, value: "" });

    do {
      const c = chunk.advance();

      /*console.log(
        `${captured.state} ${c}(${String.fromCharCode(c)}) '${
          captured.value
        }' ${chunk.position} ${chunk.buffer}`
      );*/

      switch (captured.state) {
        case 0:
          captured.state = 1;
          break;
        case 1:
          switch (c) {
            case DOUBLE_QUOTE:
              /*console.log(
                `END ${chunk.position} ${this.markedPosition} ${chunk.buffer}`
              );*/

              const token = new this(captured.value);
              return token;
              break;
            case BACKSLASH:
              captured.state = 2;
              break;
            default:
              if (c >= 0) {
                captured.value += String.fromCharCode(c);
              } else {
                /*console.log(
                  `FILL ${chunk.position} ${this.markedPosition} ${
                    chunk.buffer
                  }`
                );*/
                return undefined;
              }
          }
          break;

        case 2:
          switch (c) {
            case DOUBLE_QUOTE:
              captured.value += '"';
              captured.state = 1;
              break;
            case LOWERCASE_B:
              captured.value += "\b";
              captured.state = 1;
              break;
            case LOWERCASE_F:
              captured.value += "\f";
              captured.state = 1;
              break;
            case LOWERCASE_R:
              captured.value += "\r";
              captured.state = 1;
              break;
            case LOWERCASE_N:
              captured.value += "\n";
              captured.state = 1;
              break;
            case LOWERCASE_T:
              captured.value += "\t";
              captured.state = 1;
              break;
            case BACKSLASH:
              captured.value += "\\";
              captured.state = 1;
              break;
          }
          break;
      }
      //console.log('while');
    } while (true);
  }

  constructor(value) {
    super();
    Object.defineProperty(this, "value", { value: value });
  }

  get type() {
    return "string";
  }
}
