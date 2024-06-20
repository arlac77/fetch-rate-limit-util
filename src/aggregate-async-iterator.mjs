/**
 * Aggregate items from sevaral async iterators into one.
 * Items are collected first in first out from the sources.
 * Whatever source comes first will be delivered first.
 * @param {AsyncIterator<any>[]} sources
 * @return {AsyncIterable<any>} items collected from all sources
 */
export async function* aggregateFifo(sources) {
  const queue = [];

  while (sources.length > 0) {
    queue.length = 0;

    await new Promise((resolve, reject) =>
      sources.map(s =>
        s
          .next()
          .then(r => {
            if (r.done) {
              const w = sources.indexOf(s);
              if (w >= 0) {
                sources.splice(w, 1);
              }
            } else {
              queue.push(r.value);
            }
            // @ts-ignore
            resolve();
          })
          .catch(f => reject(f))
      )
    );

    for (const r of queue) {
      yield r;
    }
  }
}

/**
 * Aggregate items from sevaral async iterators into one.
 * Items are collected round robin from the sources.
 * The 2nd. round of items will only be delivered after all sources
 * have delivered their 1st. round (or reached their end).
 * @param {AsyncIterator<any>[]} sources
 * @return {AsyncIterable<any>} items collected from all sources
 */
export async function* aggregateRoundRobin(sources) {
  do {
    const results = await Promise.all(sources.map(s => s.next()));

    for (const i in results) {
      const r = results[i];

      if (r.done) {
        // @ts-ignore
        sources.splice(i, 1);
      } else {
        yield r.value;
      }
    }
  } while (sources.length > 0);
}

export default aggregateFifo;
