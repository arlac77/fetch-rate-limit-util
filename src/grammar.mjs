import {
  Parser,
  IdentifierToken,
  WhiteSpaceToken,
  NumberToken,
  StringToken
} from "pratt-parser";
import { createValue } from "./util.mjs";

class AST {
  get value() {
    return undefined;
  }
}

class ArraySlice extends AST {
  constructor(array, index) {
    super();
    Object.defineProperty(this, "value", {
      get: () => array.value[index.value]
    });
  }
}

class ObjectAccess extends AST {
  constructor(object, attribute) {
    super();
    Object.defineProperty(this, "value", {
      get: () => {
        if (object.value instanceof Promise) {
          return object.value.then(v => {
            const a = v[attribute.value];
            return a instanceof Function ? a() : a;
          });
        }
        const a = object.value[attribute.value];
        return a instanceof Function ? a() : a;
      }
    });
  }
}

class SpreadOP extends AST {
  constructor(a, b) {
    super();
    Object.defineProperty(this, "value", {
      get: () => createValue([a.value, b.value])
    });
  }
}

class BinOP extends AST {
  constructor(a, b, exec) {
    super();
    Object.defineProperty(this, "value", {
      get: () => {
        if (a.value instanceof Promise) {
          if (b.value instanceof Promise) {
            return Promise.all([a.value, b.value]).then(args =>
              exec(...args.map(v => createValue(v)))
            );
          }
          return a.value.then(a => exec(createValue(a), b));
        } else if (b.value instanceof Promise) {
          return b.value.then(b => exec(a, createValue(b)));
        }
        return exec(a, b);
      }
    });
  }
}

class TerneryOP extends AST {
  constructor(exp, a, b) {
    super();
    Object.defineProperty(this, "value", {
      get: () => (exp.value ? a.value : b.value)
    });
  }
}

class FCall extends AST {
  constructor(f, context, args) {
    super();

    Object.defineProperty(this, "value", {
      get: () =>
        Promise.all(args.map(a => a.value)).then(
          r =>
            f.apply(
              context,
              r.map(v => createValue(v))
            ).value
        )
    });
  }
}

const grammar = {
  tokens: [
    WhiteSpaceToken,
    NumberToken,
    StringToken,
    Object.create(IdentifierToken, {
      parseString: {
        value(pp) {
          let i = pp.offset + 1;
          for (;;) {
            const c = pp.chunk[i];
            if (
              (c >= "a" && c <= "z") ||
              (c >= "A" && c <= "Z") ||
              (c >= "0" && c <= "9") ||
              c === "_"
            ) {
              i += 1;
            } else {
              break;
            }
          }

          const value = pp.chunk.slice(pp.offset, i);
          const properties = pp.properties;

          pp.offset = i;

          const path = pp.context.path;

          if (path.length >= 2) {
            const ctx = path[path.length - 2];
            if (ctx.value[value] !== undefined) {
              properties.value = {
                value: ctx.value[value]
              };
              return Object.create(this, properties);
            }
          }

          for (const p of path) {
            if (p.value.constants !== undefined) {
              const v = p.value.constants[value];
              if (v !== undefined) {
                properties.value = {
                  value: v
                };
                return Object.create(this, properties);
              }
            }
          }

          const c = pp.context.constants[value];
          if (c === undefined) {
            properties.value = {
              value
            };
          } else {
            properties.value = {
              value: c
            };
          }

          return Object.create(this, properties);
        }
      }
    })
  ],

  prefix: {
    "(": {
      precedence: 80,
      led(grammar, left) {
        if (left.type === "identifier") {
          const args = [];

          if (grammar.token.value !== ")") {
            while (true) {
              args.push(grammar.expression(0));

              if (grammar.token.value !== ",") {
                break;
              }
              grammar.advance(",");
            }
          }

          grammar.advance(")");

          const f = grammar.context.functions[left.value];
          if (f) {
            if (f.arguments && f.arguments.length > args.length) {
              grammar.error("Missing argument", left, left.value);
            } else {
              if (f.arguments) {
                let i = 0;
                for (const a of f.arguments) {
                  if (!isOfType(a, args[i].value)) {
                    grammar.error(
                      `Wrong argument type ${a} != ${typeof args[i].value}`,
                      left,
                      left.value
                    );
                  }
                  i++;
                }
              }

              return new FCall(f, grammar.context, args);
            }
          } else {
            grammar.error("Unknown function", left, left.value);
          }
        } else {
          const e = grammar.expression(0);
          grammar.advance(")");
          return e;
        }
      }
    },
    "[": {
      nud(grammar) {
        const values = [];

        if (grammar.token.value !== "]") {
          while (true) {
            values.push(grammar.expression(0).value);

            if (grammar.token.value !== ",") {
              break;
            }
            grammar.advance(",");
          }
        }
        grammar.advance("]");
        return createValue(values);
      }
    }
  },
  infixr: {
    "..": {
      precedence: 30,
      combine: (left, right) =>
        new SpreadOP(left, right)
    },
    "&&": {
      precedence: 30,
      combine: (left, right) =>
        new BinOP(left, right, (l, r) => l.value && r.value)
    },
    "||": {
      precedence: 30,
      combine: (left, right) =>
        new BinOP(left, right, (l, r) => l.value || r.value)
    },
    "==": {
      precedence: 40,
      combine: (left, right) =>
        new BinOP(left, right, (l, r) => l.value === r.value)
    },
    "!=": {
      precedence: 40,
      combine: (left, right) =>
        new BinOP(left, right, (l, r) => l.value !== r.value)
    },
    ">=": {
      precedence: 40,
      combine: (left, right) =>
        new BinOP(left, right, (l, r) => l.value >= r.value)
    },
    "<=": {
      precedence: 40,
      combine: (left, right) =>
        new BinOP(left, right, (l, r) => l.value <= r.value)
    },
    ">": {
      precedence: 40,
      combine: (left, right) =>
        new BinOP(left, right, (l, r) => l.value > r.value)
    },
    "<": {
      precedence: 40,
      combine: (left, right) =>
        new BinOP(left, right, (l, r) => l.value < r.value)
    }
  },
  infix: {
    ".": {
      precedence: 80,
      combine: (left, right) => new ObjectAccess(left, right)
    },
    "[": {
      precedence: 80,
      led(grammar, left) {
        const right = grammar.expression(0);
        grammar.advance("]");
        return new ArraySlice(left, right);
      }
    },

    "?": {
      precedence: 20,
      led(grammar, left) {
        const e1 = grammar.expression(0);
        grammar.advance(":");
        const e2 = grammar.expression(0);
        return new TerneryOP(left, e1, e2);
      }
    },
    ":": {},
    "]": {},
    ",": {},
    ")": {},
    "+": {
      precedence: 50,
      combine: (left, right) =>
        new BinOP(left, right, (l, r) => l.value + r.value)
    },
    "-": {
      precedence: 50,
      combine: (left, right) =>
        new BinOP(left, right, (l, r) => l.value - r.value)
    },
    "*": {
      precedence: 60,
      combine: (left, right) =>
        new BinOP(left, right, (l, r) => l.value * r.value)
    },
    "/": {
      precedence: 60,
      combine: (left, right) =>
        new BinOP(left, right, (l, r) => l.value / r.value)
    }
  }
};

export class ConfigParser extends Parser {
  constructor() {
    super(grammar);
  }
}

function isOfType(typeDescription, value) {
  const tv = typeof value;

  for (const t of typeDescription.split(/\|/)) {
    if (t === tv) {
      return true;
    }
    if (t === "integer" && tv === "number") {
      return true;
    }
  }

  // TODO how to handle promises ?
  if (value instanceof Promise) {
    return true;
  }

  return false;
}
