export async function rateLimitHandler(fetcher,queryWait = (msecs,nthTry) => nthTry < 5 ? msecs : -1) {
  let response;

  for (let i = 0;; i++) {
    response = await fetcher();

    switch (response.status) {
      default:
        return response;

      case 403:
        // https://developer.github.com/v3/#rate-limiting

        const remainingRateLimit = parseInt(
          response.headers.get("x-ratelimit-remaining")
        );

        const resetRateLimit = parseInt(
          response.headers.get("x-ratelimit-reset")
        );

        let millisecondsToWait =
          new Date(resetRateLimit * 1000).getTime() - Date.now();

        console.log(
          "x-ratelimit-remaining",
          remainingRateLimit,
          resetRateLimit,
          millisecondsToWait / 1000
        );

        millisecondsToWait = queryWait(millisecondsToWait, i, response);
        if(millisecondsToWait <= 0) { return response; }
        console.log(`wait ${millisecondsToWait / 1000} (${response.url}) ...`);
        await new Promise(resolve => setTimeout(resolve, millisecondsToWait));
    }
  }
  return response;
}
