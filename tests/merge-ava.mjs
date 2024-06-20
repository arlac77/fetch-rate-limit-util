import test from "ava";
import { expand } from "config-expander";
import { equal } from "../src/util.mjs";

test("merge", async t =>
  t.deepEqual(
    await expand(
      { a: { b: "${1 - 1}", b1: 2, b3: 3 }, a1: ["a"], a2: { b1: 7 } },
      { default: { a: { b1: 1, b2: "${1 + 2}", b3: null } } }
    ),
    {
      a: { b: 0, b1: 2, b2: 3, b3: 3 },
      a1: ["a"],
      a2: { b1: 7 }
    }
  ));

test("merge Buffer", async t =>
  t.deepEqual(
    await expand(
      { buffer: Buffer.from([0x07, 0x06]) },
      {
        default: { buffer: Buffer.from([0x05, 0x04]) }
      }
    ),
    { buffer: Buffer.from([0x07, 0x06]) }
  ));

test("merge complex array", async t =>
  t.deepEqual(
    await expand([{ a: 1 }, { b: 2 }], {
      default: [{ a: 1 }, { b: 2 }]
    }),
    [{ a: 1 }, { b: 2 }]
  ));

test("merge complex array 2", async t =>
  t.deepEqual(
    await expand(
      [
        {
          type: "github-repository-provider"
        },
        {
          type: "gitea-repository-provider"
        }
      ],
      {
        default: [
          {
            type: "github-repository-provider"
          }
        ]
      }
    ),
    [
      {
        type: "github-repository-provider"
      },
      {
        type: "gitea-repository-provider"
      }
    ]
  ));

test("merge array", async t =>
  t.deepEqual(
    await expand(
      { analyse: { skip: ["!test", "!tests"] } },
      {
        default: {
          analyse: { skip: ["!test", "!tests"] },
          queues: {
            process: {
              active: true
            }
          }
        }
      }
    ),
    {
      analyse: {
        skip: ["!test", "!tests"]
      },
      queues: {
        process: {
          active: true
        }
      }
    }
  ));

  test("merge object replaces string", async t =>
  t.deepEqual(
    await expand({ a: { k: 1} }, {
      default: { a: "hello" }
    }),
    { a: { k: 1 } }
  ));

test("eq1", t => {
  t.true(equal(1, 1));
  t.true(equal([1], [1]));
  t.true(equal([{ a: 1 }], [{ a: 1 }]));
  t.false(equal([{ a: 1 }], [{ b: 1 }]));
});
