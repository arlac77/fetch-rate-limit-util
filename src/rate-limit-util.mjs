/**
 * @typedef {Object} HandlerResult
 * @property {number} [retries] max number of retries that should be executed
 * @property {repeastAfter} [number] of milliseconds to wait befor next try
 */

/**
 *
 * @param {Function} fetch executes the fetch operation
 * @param {string|URL} url
 * @param {Object} fetchOptions
 * @param {Object} stateActions
 * @return {Promise<Response>} from fetch
 */
export async function stateActionHandler(
  fetch,
  url,
  fetchOptions,
  postprocess = response => response,
  stateActions = defaultStateActions
) {
  for (let nthTry = 1; ; nthTry++) {
    try {
      const response = await fetch(url, fetchOptions);

      const action = stateActions[response.status];

      console.log(
        "STATE ACTION",
        response.status,
        nthTry,
        action,
        url.toString()
      );

      if (action === undefined) {
        return postprocess(response);
      }

      const { retries, repeatAfter } =
        typeof action === "function" ? action(response, nthTry) : action;

      if (nthTry >= retries) {
        return postprocess(response);
      }

      if (repeatAfter > 0) {
        await new Promise(resolve => setTimeout(resolve, repeatAfter));
      }
    } catch (e) {
      console.log(e);
    }
  }
}

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
export function waitDecide(
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
 * @param {Response} response
 * @param {number} nthTry
 * @returns {HandlerResult}
 */
export function rateLimit(response, nthTry) {
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
    return { retries: 0 };
  }

  return { repeatAfter: millisecondsToWait };
}

export const retryAction = { retries: 3, repeatAfter: 2000 };
export const finishAction = { retries: 0 };

export const defaultStateActions = {
  400: retryAction,
  401: finishAction,
  403: rateLimit,
  408: retryAction,
  423: retryAction,
  429: rateLimit,
  444: retryAction,
  451: finishAction,
  500: retryAction,
  502: retryAction,
  504: retryAction,
  599: retryAction
};
