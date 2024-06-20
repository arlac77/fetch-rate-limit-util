import test from "ava";
import { aft } from "./helper/util.mjs";
import aggregate, { aggregateFifo } from "aggregate-async-iterator";

test("default is aggregateFifo", t => {
  t.is(aggregateFifo, aggregate);
});

test(
  "simple",
  aft,
  aggregateFifo,
  [
    ["A", 100, 5],
    ["B", 34, 7]
  ],
  ["B0", "B1", "A0", "B2", "B3", "B4", "A1", "B5", "B6", "A2", "A3", "A4"]
);

test.only(
  "first faster",
  aft,
  aggregateFifo,
  [
    ["A", 10, 2],
    ["B", 30, 2],
    ["C", 40, 4]
  ],
  ["A0", "A1", "B0", "C0", "B1", "C1", "C2", "C3"]
);

test(
  "rejects",
  aft,
  aggregateFifo,
  [
    ["A", 100, 5, 2],
    ["B", 34, 7]
  ],
  ["B0", "B1", "A0", "B2", "B3", "B4", "A1", "B5", "B6"],
  "A2"
);

test("only rejects", aft, aggregateFifo, [["A", 100, 5, 0]], [], "A0");
test(
  "several only rejects",
  aft,
  aggregateFifo,
  [
    ["A", 100, 5, 0],
    ["B", 30, 5, 0]
  ],
  [],
  "B0"
);

test(
  "empty",
  aft,
  aggregateFifo,
  [
    ["A", 100, 0],
    ["B", 100, 0]
  ],
  []
);

test("no input", aft, aggregateFifo, [], []);

test(
  "single source",
  aft,
  aggregateFifo,
  [["A", 100, 5]],
  ["A0", "A1", "A2", "A3", "A4"]
);
