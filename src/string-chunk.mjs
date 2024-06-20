/**
 * @property {Number} position current peek position in the buffer
 * @property {string} buffer
 * @property {Number} currentLine
 */
export class StringChunk {
  constructor(buffer = "", isLast = false) {
    this.buffer = buffer;
    this.position = 0;
    this.currentLine = 1;
    this.isLast = isLast;
  }

  show(prefix = "") {
    const line = this.buffer.split(/\n/)[0];

    prefix = `${prefix},${this.currentLine}: `;

    return `${prefix}${line}\n${" ".repeat(this.position + prefix.length)}^`;
  }

  /**
   * append content of buffer
   * and reset the position(s)
   * @param {string} buffer
   */
  append(buffer) {
    let preserve = this.position;
    if (this.markedPosition < preserve) {
      preserve = this.markedPosition;
    }

    if (preserve >= this.buffer.length) {
      this.buffer = buffer;
    } else {
      this.buffer = this.buffer.slice(preserve) + buffer;
    }
    preserve += 1; // TODO
    this.markedPosition -= preserve;
    this.position -= preserve;
  }

  /**
   * Indicate that this will be the last chunk
   * append content of buffer
   * and reset the position(s)
   * @param {string} buffer
   */
  appendLast(buffer) {
    this.append(buffer);
    this.isLast = true;
  }

  /**
   *
   */
  extractFromMarkedPosition() {
    const n = this.markedPosition;
    delete this.markedPosition;
    return this.buffer.slice(n, this.position);
  }

  /**
   * mark position and prepserve state
   * @param {object} state
   * @return former preseved or newly set state
   */
  markPosition(state) {
    if (this.markedPosition === undefined) {
      this.markedPosition = this.position;
      this.tokenState = state;
      return this.tokenState;
    }
    return this.tokenState;
  }

  *[Symbol.iterator]() {
    for (; this.position < this.buffer.length; this.position++) {
      yield this.buffer.charCodeAt(this.position);
    }
  }

  /**
   * @return {Number} char at the current position
   */
  peek() {
    return this.buffer.charCodeAt(this.position);
  }

  /**
   * Advance current position by one (after delivring the current char)
   * @return {Number} char at the current position
   */
  advance() {
    return this.buffer.charCodeAt(this.position++);
  }

  /**
   * Advance current position by numberOfChars
   * @param {Number} numberOfChars
   */
  advanceBy(numberOfChars) {
    this.position += numberOfChars;
  }

  lineEndReached() {
    this.currentLine++;
  }
}
