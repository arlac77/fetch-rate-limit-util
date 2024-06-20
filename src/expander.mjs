function _quote(str) {
  return str;
}

/**
 * @callback Evaluator
 * @param {string} expression
 * @param {Object} context
 * @param {[PathEntry]} path
 * @return {Object} expression evaluation result
 */

/**
 * @typedef {Object} PathEntry
 * @property {Object} value
 */

/**
 * @callback Quoter
 * @param {string} value to be quoted
 * @return {string} quoted value
 */

/**
 * @callback Expander
 * @param {string|boolean|number|bigint|Object|Map|Set} value
 * @param {PathEntry[]} [path]
 * @return {string|boolean|number|bigint|Object|Map|Set} expression evaluation result
 */

/**
 * @typedef {Object} ExpressionExpander
 * @property {Object} properties
 * @property {Expander} expand
 */

/**
 * Creates a new expansion context
 * @param {Object} [options] object with the following keys
 * @param {string} [options.leftMarker] lead in of expression
 * @param {string} [options.rightMarker] lead out of expression
 * @param {RegExp|string} [options.markerRegexp] expression with lead in / out
 * @param {Quoter} [options.valueQuoter] to quote expanded values
 *    by default no special quoting is done and the evaluated result will be direcly
 *    inserted into the output string
 * @param {Evaluator} [options.evaluate] evaluate(expression,context,path) function to evaluate expressions
 *    the default evaluation function does a lookup into the properties
 * @param  {boolean} [options.keepUndefinedValues] true: is expression resolves to undefind the original string will be used (with surrounding ${})
 * @param {number} [options.maxNestingLevel] max number of recursive calls to expand defaults to 20
 * @param {Object} [options.properties] default properties to evaluate expression against
 * @return {ExpressionExpander} newly created expansion context
 */
export function createContext(options) {
  const leftMarker = options?.leftMarker || "${";
  const rightMarker = options?.rightMarker || "}";
  const markerRegexp = new RegExp(options?.markerRegexp || /\${([^}]+)}/, "g");
  const keepUndefinedValues =
    options?.keepUndefinedValues === undefined
      ? false
      : options.keepUndefinedValues;

  const valueQuoter = options?.valueQuoter || _quote;
  const maxNestingLevel = options?.maxNestingLevel || 20;

  let properties = options?.properties || {};

  function _evaluate(expression) {
    return properties[expression];
  }

  const evaluate = options?.evaluate || _evaluate;

  const context = Object.create(
    {
      /**
       * @type {Expander}
       */
      expand(
        object,
        path = [
          {
            value: object
          }
        ]
      ) {
        const promises = [];
        const value = _expand(object, path, promises);
        if (promises.length !== 0) {
          return Promise.all(promises).then(() => value);
        }
        return value;
      }
    },
    {
      /**
       * Properties used for the default expander implementation
       */
      properties: {
        get() {
          return properties;
        },
        set(newProperties) {
          properties = newProperties;
        }
      }
    }
  );

  function _expand(object, path, promises) {
    if (path.length >= maxNestingLevel) {
      throw new Error(
        `Max nesting level ${maxNestingLevel} reached: ${object}`
      );
    }

    if (typeof object === "string" || object instanceof String) {
      let wholeValue;

      const localPromises = [];
      const v = object.replace(markerRegexp, (match, key, offset, string) => {
        let value = evaluate(key, context, path);

        if (typeof value === "string" || value instanceof String) {
          value = valueQuoter(_expand(value, path, promises));
        } else if (value === undefined) {
          value = keepUndefinedValues ? leftMarker + key + rightMarker : "";
        }
        if (
          string.length ===
          key.length + leftMarker.length + rightMarker.length
        ) {
          wholeValue = value;
          return "";
        }

        if (value instanceof Promise) {
          localPromises.push(value);
          return "${" + (localPromises.length - 1) + "}";
        }
        return value;
      });

      if (wholeValue !== undefined) {
        return wholeValue;
      }

      if (localPromises.length !== 0) {
        return Promise.all(localPromises).then(all =>
          v.replace(/\$\{(\d+)\}/g, (match, key) => all[parseInt(key, 10)])
        );
      }

      return v;
    }

    switch (typeof object) {
      case "undefined":
      case "boolean":
      case "number":
      case "bigint":
      case "function":
        return object;
    }

    if (
      object === null ||
      object instanceof Number ||
      object instanceof Date
    ) {
      // TODO: find a better way to identify special cases
      return object;
    }

    if (object instanceof Map) {
      const r = new Map();
      for (const [key, value] of object.entries()) {
        const path2 = [
          ...path,
          {
            key,
            value
          }
        ];

        r.set(_expand(key, path2, promises), _expand(value, path2, promises));
      }

      return r;
    }

    if (object instanceof Set) {
      const r = new Set();
      for (const value of object.values()) {
        r.add(_expand(value, [...path, { value }], promises));
      }

      return r;
    }

    if (Array.isArray(object)) {
      const array = new Array(object.length);

      for (let index = 0; index < object.length; index++) {
        const o = object[index];

        const r = _expand(
          o,
          [
            ...path,
            {
              key: index,
              value: o
            }
          ],
          promises
        );
        if (r instanceof Promise) {
          promises.push(r);
          r.then(f => (array[index] = f));
        }
        array[index] = r;
      }

      return array;
    }

    if (object.constructor?.name === "Buffer") {
      return object;
    }

    let newObject = {};

    for (let [key, value] of Object.entries(object)) {
      const newKey = _expand(key, path, promises);
      if (typeof newKey === "string" || newKey instanceof String) {
        value = _expand(
          value,
          [
            ...path,
            {
              key,
              value
            }
          ],
          promises
        );
        if (value instanceof Promise) {
          promises.push(value);
          value.then(v => (newObject[newKey] = v));
        }
        newObject[newKey] = value;
      } else {
        newObject = newKey;
      }
    }

    return newObject;
  }

  return context;
}
