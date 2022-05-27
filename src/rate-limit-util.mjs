import { ETagDummyCache } from "./etag-dummy-cache.mjs";

/**
 * @typedef {Object} HandlerResult
 * @property {number} [retries] max number of retries that should be executed
 * @property {repeatAfter} [number] of milliseconds to wait befor next try
 * @property {string} message to report
 * @property {boolean} done op is finished return
 * @property {Response} response
 * @property {boolean} postprocess exec postprocess
 */

/**
 * Function to provide progress report.
 * @typedef {Function} RequestReporter
 * @property {String} url to be requested
 * @property {String} method http method name
 * @param {Object} options
 * @property {String|Error} status result of the last request
 * @property {number} nthTry how often have we retried
 */

async function wait(url, options, actionResult, reporter) {
  if (actionResult.repeatAfter > 0) {
    if (reporter && actionResult.message) {
      reporter(url, options.method || "GET", actionResult.message);
    }

    await new Promise(resolve => setTimeout(resolve, actionResult.repeatAfter));
  }
}

/**
 * Executes fetch operation and handles response.
 * @param {Function} fetch executes the fetch operation
 * @param {string|URL} url
 * @param {Object} options
 * @param {Function} postprocess
 * @param {Object} stateActions
 * @param {RequestReporter} reporter
 * @return {Promise<Response>} from fetch
 */
export async function stateActionHandler(
  fetch,
  url,
  options = {},
  postprocess,
  stateActions = defaultStateActions,
  reporter
) {
  if (options.headers === undefined) {
    options.headers = {};
  }

  if (options.method === undefined) {
    options.method = "GET";
  }

  if (options.method === "GET" || options.method === "HEAD") {
    await stateActions.cache.addHeaders(url, options.headers);
  }

  for (let nthTry = 1; nthTry < MAX_RETRIES; nthTry++) {
    let actionResult;
    try {
      const response = await fetch(url, options);
      const action = stateActions[response.status] || defaultHandler;
      actionResult = action(stateActions, response, nthTry);

      if (reporter) {
        reporter(url, options.method, response.status, nthTry);
      }

      if (actionResult.done) {
        if (postprocess) {
          if (actionResult.postprocess) {
            return await postprocess(response);
          }
          return { response };
        }

        return response;
      }

      await wait(url, options, actionResult, reporter);

      if (actionResult.url) {
        url = actionResult.url;
      }
    } catch (e) {
      if (reporter) {
        reporter(url, options.method, e, nthTry);
      }

      const action = stateActions[e.errno];

      if (action) {
        actionResult = action(stateActions, undefined, nthTry);

        if (actionResult.repeatAfter === undefined) {
          throw e;
        }

        await wait(url, options, actionResult, reporter);
      } else {
        throw e;
      }
    }
  }

  throw new Error(
    `${url},${options.method}: Max retry count reached (${MAX_RETRIES})`
  );
}

/**
 * Minimum wait time in msecs.
 */
export const MIN_WAIT_MSECS = 1000;

/**
 * Max # of retries.
 */
export const MAX_RETRIES = 4;

/**
 * Waits and retries after rate limit reset time has reached.
 * @see https://auth0.com/docs/policies/rate-limit-policy
 * @see https://developer.github.com/v3/#rate-limiting
 * @see https://opensource.zalando.com/restful-api-guidelines/#153
 * @param {Response} response
 * @param {number} nthTry
 * @returns {HandlerResult}
 */
export function rateLimitHandler(stateActions, response, nthTry) {
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
    if (value != null && value !== undefined) {
      let repeatAfter = f(value);
      if (repeatAfter) {
        if (repeatAfter < MIN_WAIT_MSECS) {
          repeatAfter = MIN_WAIT_MSECS;
        }
        return {
          repeatAfter,
          done: false,
          postprocess: false,
          message: `Rate limit reached: waiting for ${repeatAfter / 1000}s`
        };
      }
    }
  }
  return { done: true, response, postprocess: response.ok };
}

/**
 * Increasing delay for each retry
 */
const retryTimes = [100, 10000, 30000, 60000];

/**
 * Try 3 times with a delay.
 * @param {Object} response
 * @param {number} nthTry
 * @returns {HandlerResult}
 */
export function retryHandler(stateActions, response, nthTry) {
  const repeatAfter = retryTimes[nthTry];

  if (repeatAfter) {
    return {
      postprocess: false,
      repeatAfter,
      message: `Waiting for ${repeatAfter / 1000}s`
    };
  }

  return { done: false, response, postprocess: false };
}

export function redirectHandler(stateActions, response, nthTry) {
  if (nthTry <= 3) {
    return {
      postprocess: false,
      repeatAfter: 0,
      url: response.headers.get("location")
    };
  }
  return { done: false, response, postprocess: false };
}

/**
 * Postprocessing if response is ok
 */

export function defaultHandler(stateActions, response, nthTry) {
  stateActions.cache.storeResponse(response);
  return { done: true, response, postprocess: response.ok };
}

/**
 * No postprocessing
 */
export function errorHandler(stateActions, response, nthTry) {
  return { done: true, response, postprocess: false };
}

/**
 * provide cached data
 * @param {*} response
 * @param {*} nthTry
 * @returns
 */
export function cacheHandler(stateActions, response, nthTry) {
  return { done: true, postprocess: response.ok, response: stateActions.cache.loadResponse(response.url) };
}

export const defaultStateActions = {
  "-1": retryHandler,
  0: retryHandler,
  201: defaultHandler, // Created
  301: redirectHandler,
  302: redirectHandler,
  304: cacheHandler, // Not Modified cache ?
  307: redirectHandler,
  308: redirectHandler,
  400: errorHandler, // Bad Request
  401: defaultHandler,
  403: rateLimitHandler,
  404: defaultHandler, // NOT Found
  408: retryHandler, // Request timeout
  409: retryHandler, // Conflict
  422: defaultHandler, // UNPROCESSABLE ENTITY
  423: retryHandler,
  429: rateLimitHandler,
  444: retryHandler,
  451: defaultHandler,
  500: retryHandler, // Internal Server Error
  502: retryHandler, // Bad Gateway
  503: retryHandler, // Service Unavailable
  504: retryHandler, // Gateway Timeout
  599: retryHandler,

  ERR_STREAM_PREMATURE_CLOSE: retryHandler,

  cache: new ETagDummyCache()
};
