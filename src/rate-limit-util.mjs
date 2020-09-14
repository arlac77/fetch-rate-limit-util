
/**
 * 
 * @param {Integer} millisecondsToWait 
 * @param {Integer} rateLimitRemaining 
 * @param {Integer} nthTry
 * @param {Object} response
 * @return {Integer} milliseconds to wait for next try or < 0 to deliver current response
 */
function defaultQueryWait(millisecondsToWait, rateLimitRemaining, nthTry, response) {
  if (nthTry > 5) return -1;

  return millisecondsToWait + 10000;
}

export async function rateLimitHandler(fetcher, queryWait = defaultQueryWait) {
  let response;

  for (let i = 0; ; i++) {
    response = await fetcher();

    switch (response.status) {
      default:
        return response;

      case 403:
        // https://auth0.com/docs/policies/rate-limit-policy
        // https://developer.github.com/v3/#rate-limiting

        const rateLimitRemaining = parseInt(
          response.headers.get("x-ratelimit-remaining")
        );

        const rateLimitReset = parseInt(
          response.headers.get("x-ratelimit-reset")
        );

        let millisecondsToWait =
          new Date(rateLimitReset * 1000).getTime() - Date.now();

        /*console.log(
          "x-ratelimit-remaining",
          remainingRateLimit,
          resetRateLimit,
          millisecondsToWait / 1000
        );*/

        millisecondsToWait = queryWait(millisecondsToWait, rateLimitRemaining, i, response);
        if (millisecondsToWait <= 0) {
          return response;
        }
        //console.log(`wait ${millisecondsToWait / 1000} (${response.url}) ...`);
        await new Promise(resolve => setTimeout(resolve, millisecondsToWait));
    }
  }
}
