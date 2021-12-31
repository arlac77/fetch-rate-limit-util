/**
 * Minimum wait time in msecs.
 */
export const MIN_WAIT_MSECS = 10000;

/**
 * Max # of wait retries.
 */
export const MAX_RETRIES = 5;

/**
 * Decide about the time to wait for a retry.
 * - only retry {@link MAX_RETRIES} times
 * - when waiting wait at least {@link MIN_WAIT_MSECS}
 * @param {Integer} millisecondsToWait # of milliseconds to wait before retry
 * @param {Integer} rateLimitRemaining parsed from "x-ratelimit-remaining" header
 * @param {Integer} nthTry how often have we retried the request already
 * @param {Object} response as returned from fetch
 * @return {Integer} milliseconds to wait for next try or < 0 to deliver current response
 */
export function defaultWaitDecide(
  millisecondsToWait,
  rateLimitRemaining,
  nthTry,
  response
) {
  if (nthTry > MAX_RETRIES) return -1;

  return millisecondsToWait + MIN_WAIT_MSECS;
}

/**
 * Waits and retries after rate limit reset time has reached.
 * @see https://auth0.com/docs/policies/rate-limit-policy
 * @see https://developer.github.com/v3/#rate-limiting
 * @see https://opensource.zalando.com/restful-api-guidelines/#153
 * @param fetcher executes the fetch operation
 * @param waitDecide
 */
export async function rateLimitHandler(
  fetch,
  url,
  args,
  waitDecide = defaultWaitDecide
) {
  for (let nthTry = 1; ; nthTry++) {
    const response = await fetch(url, args);

    const action = stateActions[response.status];

    if (action === undefined) {
      return response;
    }

    const { retries, finished, repeatAfter } =
      typeof action === "function" ? action(response, nthTry, waitDecide) : action;

    if (finished || nthTry >= retries) {
      return response;
    }

    await new Promise(resolve => setTimeout(resolve, repeatAfter));
  }
}

function rateLimit(response, nthTry, waitDecide) {
  const rateLimitReset = parseInt(response.headers.get("x-ratelimit-reset"));

  let millisecondsToWait = isNaN(rateLimitReset)
    ? 0
    : new Date(rateLimitReset * 1000).getTime() - Date.now();

  millisecondsToWait = waitDecide(
    millisecondsToWait,
    parseInt(response.headers.get("x-ratelimit-remaining")),
    nthTry,
    response
  );

  if (millisecondsToWait <= 0) {
    return { finished: true };
  }

  return { repeatAfter: millisecondsToWait };
}

const stateActions = {
  400: { retries: 3, repeatAfter: 100 },
  401: { finished: true },
  403: rateLimit,
  429: rateLimit,
  500: { retries: 3, repeatAfter: 100 }
};
