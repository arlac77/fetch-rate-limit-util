/**
 * @typedef {Object} HandlerResult
 * @property {number} [retries] max number of retries that should be executed
 * @property {repeastAfter} [number] of milliseconds to wait befor next try
 */

/**
 * @typedef {Function} RequestReporter
 * @property {String} url to be requested
 * @property {String|Error} status result og the last request
 * @property {number} nthTry retried how often
 */

/**
 *
 * @param {Function} fetch executes the fetch operation
 * @param {string|URL} url
 * @param {Object} fetchOptions
 * @param {Function} postprocess
 * @param {Object} stateActions
 * @param {RequestReporter} reporter
 * @return {Promise<Response>} from fetch
 */
export async function stateActionHandler(
  fetch,
  url,
  fetchOptions,
  postprocess = response => response,
  stateActions = defaultStateActions,
  reporter
) {
  for (let nthTry = 1; nthTry < MAX_RETRIES; nthTry++) {
    let actionResult;
    try {
      const response = await fetch(url, fetchOptions);
      const action = stateActions[response.status] || defaultAction;
      actionResult = action(response, nthTry, reporter);

      if (reporter) {
        reporter(
          url,
          response.status,
          nthTry
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
      
      if (actionResult === undefined || actionResult.repeatAfter === undefined) {
        throw e;
      }

      if (reporter) {
        reporter(url, e, nthTry);
      }
    }
  }

  throw new Error(`${url}: Max retry count reached (${MAX_RETRIES})`);
}

/**
 * Minimum wait time in msecs.
 */
export const MIN_WAIT_MSECS = 10000;

/**
 * Max # of wait retries.
 */
export const MAX_RETRIES = 4;

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
 * @param {RequestReporter} reporter
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
    reporter(response.url, `Rate limit reached: waiting for ${millisecondsToWait / 1000}s`);
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
  "-1": retryAction,
  0: retryAction,
  201: defaultAction, // Created
  301: redirectAction,
  302: redirectAction,
  307: redirectAction,
  308: redirectAction,
  400: retryAction,
  401: defaultAction,
  403: rateLimit,
  404: defaultAction, // NOT Found
  408: retryAction,  // Request timeout
  422: defaultAction, // UNPROCESSABLE ENTITY
  423: retryAction,
  429: rateLimit,
  444: retryAction,
  451: defaultAction,
  500: retryAction,
  502: retryAction,
  504: retryAction,
  599: retryAction
};
