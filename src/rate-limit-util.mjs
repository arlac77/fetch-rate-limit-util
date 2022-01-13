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
 * @param {Function} postprocess
 * @param {Object} stateActions
 * @param {Function} reporter
 * @return {Promise<Response>} from fetch
 */
export async function stateActionHandler(
  fetch,
  url,
  fetchOptions,
  postprocess = response => response,
  stateActions = defaultStateActions,
  reporter /*= console.log*/
) {
  for (let nthTry = 1; nthTry < 10; nthTry++) {
    let actionResult;
    try {
      const response = await fetch(url, fetchOptions);
      const action = stateActions[response.status] || defaultAction;
      actionResult = action(response, nthTry, reporter);

      if (reporter) {
        reporter(
          url.toString(),
          response.status,
          nthTry,
          action.name,
          actionResult
        );
      }

      if (actionResult.repeatAfter === undefined) {
        return postprocess(response);
      }

      if (actionResult.repeatAfter > 0) {
        await new Promise(resolve =>
          setTimeout(resolve, actionResult.repeatAfter)
        );
      }

      if (actionResult.url) {
        url = actionResult.url;
      }
    } catch (e) {

      /*
        type: 'system',
        errno: 'ERR_STREAM_PREMATURE_CLOSE',
        code: 'ERR_STREAM_PREMATURE_CLOSE',
        erroredSysCall: undefined
       */
      
      if (actionResult.repeatAfter === undefined) {
        throw e;
      }

      if (reporter) {
        reporter(e);
      }
    }
  }

  //throw new Error("Max retry count reached");
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
export function rateLimit(response, nthTry, reporter) {
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
    return {};
  }

  if (reporter) {
    reporter(`Rate limit reached: waiting for ${millisecondsToWait / 1000}s`);
  }

  return { repeatAfter: millisecondsToWait };
}

function retryAction(response, nthTry) {
  if (nthTry <= 3) {
    return { repeatAfter: 5000 };
  }

  return {};
}

function redirectAction(response, nthTry) {
  if (nthTry <= 3) {
    return { repeatAfter: 0, url: response.headers.get("location") };
  }
  return {};
}

function defaultAction(response, nthTry) {
  return {};
}

export const defaultStateActions = {
  201: defaultAction, // Created
  301: redirectAction,
  302: redirectAction,
  307: redirectAction,
  308: redirectAction,
  400: retryAction,
  401: defaultAction,
  403: rateLimit,
  404: defaultAction, // NOT Found
  408: retryAction,
  423: retryAction,
  429: rateLimit,
  444: retryAction,
  451: defaultAction,
  500: retryAction,
  502: retryAction,
  504: retryAction,
  599: retryAction
};
