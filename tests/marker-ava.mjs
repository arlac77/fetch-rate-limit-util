import test from "ava";
import { expand, createValue } from "config-expander";

const basedir = new URL(".", import.meta.url).pathname;
const extraMarker = {
  leftMarker: "${{",
  rightMarker: "}}",
  markerRegexp: /\${{([^}]+)}}/,
};

test("string concat", async (t) =>
  t.is(await expand("${{'x' + 'y'}}", extraMarker), "xy"));

test("addition", async (t) => t.is(await expand("${{1 + 2}}", extraMarker), 3));
test("substraction", async (t) =>
  t.is(await expand("${{3 - 2}}", extraMarker), 1));
test("multiplication", async (t) =>
  t.is(await expand("${{3 * 2}}", extraMarker), 6));
test("division", async (t) => t.is(await expand("${{8/2}}", extraMarker), 4));
test("number", async (t) =>
  t.is(await expand("${{number('77')}}", extraMarker), 77));

test("greater than false", async (t) =>
  t.falsy(await expand("${{1 > 2}}", extraMarker)));
test("greater than true", async (t) =>
  t.truthy(await expand("${{2 > 1}}", extraMarker)));
test("greater equal false", async (t) =>
  t.falsy(await expand("${{1 >= 2}}", extraMarker)));
test("greater equal true", async (t) =>
  t.truthy(await expand("${{2 >= 1}}", extraMarker)));
test("less than false", async (t) =>
  t.falsy(await expand("${{2 < 1}}", extraMarker)));
test("less than true", async (t) =>
  t.truthy(await expand("${{1 < 2}}", extraMarker)));

test("less equal than false", async (t) =>
  t.falsy(await expand("${{2 <= 1}}", extraMarker)));
test("less equal than true", async (t) =>
  t.truthy(await expand("${{1 <= 2}}", extraMarker)));

test("equal true", async (t) =>
  t.truthy(await expand("${{1 == 1}}", extraMarker)));
test("equal false", async (t) =>
  t.falsy(await expand("${{1 == 2}}", extraMarker)));

test("not equal true", async (t) =>
  t.truthy(await expand("${{2 != 1}}", extraMarker)));
test("not equal false", async (t) =>
  t.falsy(await expand("${{2 != 2}}", extraMarker)));

test("or false", async (t) =>
  t.falsy(await expand("${{0 || 0}}", extraMarker)));
test("or true", async (t) =>
  t.truthy(await expand("${{1 || 0}}", extraMarker)));

test("and false", async (t) =>
  t.falsy(await expand("${{1 && 0}}", extraMarker)));
test("and true", async (t) =>
  t.truthy(await expand("${{1 && 1}}", extraMarker)));

test("or true cobined", async (t) =>
  t.truthy(await expand("${{1 > 2 || 1 > 0}}", extraMarker)));
test("or false cobined", async (t) =>
  t.falsy(await expand("${{1 > 2 || 1 < 0}}", extraMarker)));

test("and false cobined", async (t) =>
  t.falsy(await expand("${{1>0 && 0>1}}", extraMarker)));
test("and true cobined", async (t) =>
  t.truthy(await expand("${{1>0 && 2>0}}", extraMarker)));

test("tenery true 1st.", async (t) =>
  t.is(await expand("${{2 > 1 ? 22 : 11}}", extraMarker), 22));
test("tenery false 2nd.", async (t) =>
  t.is(await expand("${{2 < 1 ? 22 : 11}}", extraMarker), 11));
test("tenery combined false 2nd.", async (t) =>
  t.is(await expand("${{2 < 1 ? 22+1 : 11+1}}", extraMarker), 12));
test("tenery combined true 2nd.", async (t) =>
  t.is(await expand("${{2*0 < 1 ? 22+1 : 11+1}}", extraMarker), 23));
test("tenery combined true 2nd. with function call", async (t) =>
  t.is(
    await expand("${{'a'=='b' ? 22+1 : substring('abc',1,2)}}", extraMarker),
    "b"
  ));
test("tenery combined true with property access", async (t) =>
  t.is(
    await expand(
      "${{os.platform=='darwin' || os.platform=='linux' ? 1 : 0}}",
      extraMarker
    ),
    1
  ));

test("toUpperCase", async (t) =>
  t.is(await expand("${{toUpperCase('lower')}}", extraMarker), "LOWER"));
test("toLowerCase", async (t) =>
  t.is(await expand("${{toLowerCase('UPPER')}}", extraMarker), "upper"));
test("substring", async (t) =>
  t.is(await expand("${{substring('lower',1,3)}}", extraMarker), "ow"));
test("replace", async (t) =>
  t.is(await expand("${{replace('lower','ow','12')}}", extraMarker), "l12er"));

test("unknown function", async (t) =>
  t.throwsAsync(
    async () => expand("${{  thisFunctionIsUnknown()}}", extraMarker),
    {
      message: '1,2: Unknown function "thisFunctionIsUnknown"',
    }
  ));

test("missing argument", async (t) =>
  t.throwsAsync(async () => expand("${{toUpperCase()}}", extraMarker), {
    message: '1,0: Missing argument "toUpperCase"',
  }));

test("wrong argument type", async (t) =>
  t.throwsAsync(async () => expand("${{toUpperCase(2)}}", extraMarker), {
    message: '1,0: Wrong argument type string != number "toUpperCase"',
  }));

test("length (string)", async (t) =>
  t.is(await expand("${{length('abc')}}", extraMarker), 3));
test("length (array)", async (t) =>
  t.is(await expand("${{length([1,2,3])}}", extraMarker), 3));

test("first number", async (t) =>
  t.is(await expand("${{first(1,2,3)}}", extraMarker), 1));
test("first string", async (t) =>
  t.is(await expand("${{first('a','b')}}", extraMarker), "a"));
test("first missing", async (t) =>
  t.is(await expand("${{first(env.MISSING,'b')}}", extraMarker), "b"));

test("split", async (t) =>
  t.deepEqual(await expand("${{split('1,2,3,4',',')}}", extraMarker), [
    "1",
    "2",
    "3",
    "4",
  ]));

test("substring with expressions", async (t) =>
  t.is(await expand("${{substring('lower',1,1+2*1)}}", extraMarker), "ow"));

test("encrypt/decrypt", async (t) =>
  t.is(
    await expand("${{decrypt('key',encrypt('key','secret'))}}", 
      extraMarker,
    ),
    "secret"
  ));

test("user defined functions", async (t) =>
  t.is(
    await expand("${{myFunction()}}", {
      functions: {
        myFunction: {
          arguments: [],
          apply: () => {
            return createValue(77);
          },
        },
      },
      ...extraMarker
    }),
    77
  ));

test("function promise arg", async (t) =>
  t.is(
    await expand(
      "${{substring(string(document('../tests/fixtures/short.txt')),0,4)}}",
      {
        constants: {
          basedir,
        },
        ...extraMarker,
      }
    ),
    "line"
  ));

test("two promises binop", async (t) =>
  t.is(
    (
      await expand(
        "${{document('../tests/fixtures/short.txt') + document('../tests/fixtures/short2.txt')}}",
        {
          constants: {
            basedir,
          },
          ...extraMarker,
        }
      )
    ).toString(),
    "line 1\nline 2\n"
  ));

test("left only promise binop", async (t) =>
  t.is(
    (
      await expand(
        "${{document('../tests/fixtures/short.txt') + 'XX'}}",

        {
          constants: {
            basedir,
          },
          ...extraMarker,
        }
      )
    ).toString(),
    "line 1\nXX"
  ));

test("array access", async (t) =>
  t.is(
    await expand("${{myArray[2-1]}}", {
      constants: {
        myArray: ["a", "b", "c"],
      },
      ...extraMarker,
    }),
    "b"
  ));

test("array access cascade", async (t) =>
  t.is(
    await expand("${{myArray[1][2]}}", {
      constants: {
        myArray: ["a", [0, 0, 4711], "c"],
      },
      ...extraMarker,
    }),
    4711
  ));

test("object paths one level", async (t) =>
  t.is(
    await expand("${{myObject.att1}}", {
      constants: {
        myObject: {
          att1: "val1",
        },
      },
      ...extraMarker,
    }),
    "val1"
  ));

test("object paths with promise", async (t) =>
  t.deepEqual(
    await expand("${{include('../tests/fixtures/with_sub.json').sub}}", {
      constants: {
        basedir,
        c1: "vc1",
      },
      ...extraMarker,
    }),
    {
      key: "value in other sub vc1",
    }
  ));

test("object paths several levels", async (t) =>
  t.deepEqual(
    await expand("${{myObject.level1.level2}}", {
      constants: {
        myObject: {
          level1: {
            level2: "val2",
          },
        },
      },
      ...extraMarker,
    }),
    "val2"
  ));

test("array literals", async (t) =>
  t.deepEqual(await expand("${{[1,2,3]}}", extraMarker), [1, 2, 3]));
test("array literals nested", async (t) =>
  t.deepEqual(await expand("${{[1,['a'],3]}}", extraMarker), [1, ["a"], 3]));

test("access objects first than array", async (t) =>
  t.deepEqual(
    await expand("${{myObject.level1.level2[1]}}", {
      constants: {
        myObject: {
          level1: {
            level2: [1, "val2"],
          },
        },
      },
      ...extraMarker,
    }),
    "val2"
  ));

test("access objects first than array #2", async (t) =>
  t.deepEqual(
    await expand("${{myObject.level1[1].level2}}", {
      constants: {
        myObject: {
          level1: [
            {},
            {
              level2: "val2",
            },
          ],
        },
      },
      ...extraMarker,
    }),
    "val2"
  ));

test.skip("split with array access", async (t) =>
  t.is(await expand("${{split('a:b:c:d',':')[2]}}", extraMarker), "c"));
