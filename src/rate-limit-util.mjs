
/**
 * 
 * - only retry 5 times
 * @param {Integer} millisecondsToWait
 * @param {Integer} rateLimitRemaining parsed from "x-ratelimit-remaining" header
 * @param {Integer} nthTry how often have we retried the request already
 * @param {Object} response as returned from fetch
 * @return {Integer} milliseconds to wait for next try or < 0 to deliver current response
 */
function defaultQueryWait(millisecondsToWait, rateLimitRemaining, nthTry, response) {
  if (nthTry > 5) return -1;

  return millisecondsToWait + 10000;
}

/**
 * Waits and retries after rate limit rest time has reached
 * @param fetcher executes the fetch operation
 * @param queryWait 
 */
export async function rateLimitHandler(fetcher, queryWait = defaultQueryWait) {
  let response;

  for (let i = 0; ; i++) {
    response = await fetcher();

    switch (response.status) {
      default:
        return response;

      case 403:
      case 429:
        // https://auth0.com/docs/policies/rate-limit-policy
        // https://developer.github.com/v3/#rate-limiting
        // https://opensource.zalando.com/restful-api-guidelines/#153

        const rateLimitRemaining = parseInt(
          response.headers.get("x-ratelimit-remaining")
        );

        const rateLimitReset = parseInt(
          response.headers.get("x-ratelimit-reset")
        );

        let millisecondsToWait =
          new Date(rateLimitReset * 1000).getTime() - Date.now();

        millisecondsToWait = queryWait(millisecondsToWait, rateLimitRemaining, i, response);
        if (millisecondsToWait <= 0) {
          return response;
        }
        //console.log(`wait ${millisecondsToWait / 1000} (${response.url}) ...`);
        await new Promise(resolve => setTimeout(resolve, millisecondsToWait));
    }
  }
}
