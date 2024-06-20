import { aggregateFifo } from "aggregate-async-iterator";

export async function* sequence(name, time = 100, num = 10, errIndex = -1) {
  for (let i = 0; i < num; i += 1) {
    yield new Promise((resolve, reject) =>
      setTimeout(() => {
        if (i === errIndex) {
          reject(name + i);
        } else {
          resolve(name + i);
        }
      }, time)
    );
  }
}

export class Sequencer {
  constructor(name, time = 100, num = 5, errIndex = -1) {
    this.name = name;
    this.time = time;
    this.num = num;
    this.errIndex = errIndex;
  }

  async *[Symbol.asyncIterator]() {
    for (let i = 0; i < this.num; i += 1) {
      yield new Promise((resolve, reject) =>
        setTimeout(() => {
          if (i === this.errIndex) {
            reject(this.name + i);
          } else {
            resolve(this.name + i);
          }
        }, this.time)
      );
    }
  }
}

function generateSequences(x, useClass) {
  return Array.isArray(x) ? useClass ? new Sequencer(...x) : sequence(...x) : x;
}

export async function aft(t, aggregator, input, expected, failed) {
  const results = [];

  try {
    for await (const r of aggregator(input.map(x => generateSequences(x, false)))) {
      results.push(r);
    }
  } catch (e) {
    t.is(e, failed);
  }

  t.deepEqual(results, expected, "direct AsyncIterator");

/*
  results.length = 0;
  try {
    for await (const r of aggregator(input.map(x => generateSequences(x, true)))) {
      results.push(r);
    }
  } catch (e) {
    t.is(e, failed);
  }

  t.deepEqual(results, expected, "class with AsyncIterator");
  */
}


aft.title = (providedTitle = "", aggregator, input, expected, failed = "") =>
  `aggregate ${
    aggregator === aggregateFifo ? "fifo" : "round robin"
  } ${providedTitle} ${input.map(s=>s.join(':')).join(',')} -> ${expected.length === 0 ? 'empty' : expected} ${failed ? 'failed at ' + failed :''}`.trim();
