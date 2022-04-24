/**
 * @typedef {Object} HandlerResult
 * @property {number} [retries] max number of retries that should be executed
 * @property {repeastAfter} [number] of milliseconds to wait befor next try
 * @property {string} message to report
 */

/**
 * Function to provide progress report.
 * @typedef {Function} RequestReporter
 * @property {String} url to be requested
 * @param {Object} fetchOptions
 * @property {String|Error} status result of the last request
 * @property {number} nthTry how often have we retried
 */

async function wait(url, fetchOptions, actionResult, reporter) {
  if (actionResult.repeatAfter > 0) {
    if (reporter && actionResult.message) {
      reporter(url, fetchOptions.method || "GET", actionResult.message);
    }

    await new Promise(resolve => setTimeout(resolve, actionResult.repeatAfter));
  }
}

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
  postprocess,
  stateActions = defaultStateActions,
  reporter
) {
  for (let nthTry = 1; nthTry < MAX_RETRIES; nthTry++) {
    let actionResult;
    try {
      const response = await fetch(url, fetchOptions);
      const action = stateActions[response.status] || defaultAction;
      actionResult = action(response, nthTry);

      if (reporter) {
        reporter(url, fetchOptions.method || "GET", response.status, nthTry);
      }

      if (actionResult.repeatAfter === undefined) {
        return postprocess ? await postprocess(response) : response;
      }

      await wait(url, fetchOptions, actionResult, reporter);

      if (actionResult.url) {
        url = actionResult.url;
      }
    } catch (e) {
      const action = stateActions[e.errno] || defaultAction;
      actionResult = action(undefined, nthTry);

      if (
        actionResult === undefined ||
        actionResult.repeatAfter === undefined
      ) {
        throw e;
      }

      if (reporter) {
        reporter(url, fetchOptions.method || "GET", e, nthTry);
      }

      await wait(url, fetchOptions, actionResult, reporter);
    }
  }

  throw new Error(`${url}: Max retry count reached (${MAX_RETRIES})`);
}

/**
 * Minimum wait time in msecs.
 */
export const MIN_WAIT_MSECS = 1000;

/**
 * Max # of wait retries.
 */
export const MAX_RETRIES = 4;

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
export function rateLimit(response, nthTry) {
  let repeatAfter;

  const headers = {
    "retry-after": value =>
      value.match(/^\d+$/) ? parseInt(value) * 1000 : undefined,
    "x-ratelimit-reset": value => {
      const rateLimitReset = parseInt(value);
      return isNaN(rateLimitReset)
        ? MIN_WAIT_MSECS
        : new Date(rateLimitReset * 1000).getTime() - Date.now();
    }
  };

  for (const [key, f] of Object.entries(headers)) {
    const value = response.headers.get(key);
    if (value !== undefined) {
      let repeatAfter = f(value);
      if (repeatAfter) {
        if(repeatAfter < MIN_WAIT_MSECS) {
          repeatAfter = MIN_WAIT_MSECS;
        }
        return {
          repeatAfter,
          message: `Rate limit reached: waiting for ${repeatAfter / 1000}s`
        };
      }
    }
  }
  return {};
}

/**
 * Increasing delay for each retry
 */
const retryTimes = [100, 5000, 30000, 60000];

/**
 * Try 3 times with a delay.
 * @param {Object} response
 * @param {number} nthTry
 * @returns
 */
function retryAction(response, nthTry) {
  const repeatAfter = retryTimes[nthTry];

  if (repeatAfter) {
    return { repeatAfter, message: `Waiting for ${repeatAfter / 1000}s` };
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
  408: retryAction, // Request timeout
  422: defaultAction, // UNPROCESSABLE ENTITY
  423: retryAction,
  429: rateLimit,
  444: retryAction,
  451: defaultAction,
  500: retryAction,
  502: retryAction,
  504: retryAction,
  599: retryAction,

  ERR_STREAM_PREMATURE_CLOSE: retryAction
};
