[![npm](https://img.shields.io/npm/v/fetch-rate-limit-util.svg)](https://www.npmjs.com/package/fetch-rate-limit-util)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![minified size](https://badgen.net/bundlephobia/min/fetch-rate-limit-util)](https://bundlephobia.com/result?p=fetch-rate-limit-util)
[![downloads](http://img.shields.io/npm/dm/fetch-rate-limit-util.svg?style=flat-square)](https://npmjs.org/package/fetch-rate-limit-util)
[![GitHub Issues](https://img.shields.io/github/issues/arlac77/fetch-rate-limit-util.svg?style=flat-square)](https://github.com/arlac77/fetch-rate-limit-util/issues)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Farlac77%2Ffetch-rate-limit-util%2Fbadge\&style=flat)](https://actions-badge.atrox.dev/arlac77/fetch-rate-limit-util/goto)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/arlac77/fetch-rate-limit-util/badge.svg)](https://snyk.io/test/github/arlac77/fetch-rate-limit-util)
[![Coverage Status](https://coveralls.io/repos/arlac77/fetch-rate-limit-util/badge.svg)](https://coveralls.io/github/arlac77/fetch-rate-limit-util)

# fetch-rate-limit-util

Handle fetch errors and rate limits.
Waits and retry after rate limit rest time has reached.

*   [auth0 API](https://auth0.com/docs/policies/rate-limit-policy)
*   [github API](https://developer.github.com/v3/#rate-limiting)
*   [Zalando API](https://opensource.zalando.com/restful-api-guidelines/#153)

```js
import { rateLimitHandler } from "fetch-rate-limit-util";

const response = rateLimitHandler( () => fetch(someURL));
```

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

*   [HandlerResult](#handlerresult)
    *   [Properties](#properties)
*   [RequestReporter](#requestreporter)
    *   [Properties](#properties-1)
*   [stateActionHandler](#stateactionhandler)
    *   [Parameters](#parameters)
*   [MIN_WAIT_MSECS](#min_wait_msecs)
*   [MAX_RETRIES](#max_retries)
*   [waitDecide](#waitdecide)
    *   [Parameters](#parameters-1)
*   [rateLimit](#ratelimit)
    *   [Parameters](#parameters-2)
*   [retryTimes](#retrytimes)
*   [retryAction](#retryaction)
    *   [Parameters](#parameters-3)

### HandlerResult

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

#### Properties

*   `retries` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** max number of retries that should be executed
*   `number` **repeastAfter?** of milliseconds to wait befor next try
*   `message` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** to report

### RequestReporter

Function to provide progress report.

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

#### Properties

*   `url` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** to be requested
*   `status` **([String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error))** result of the last request
*   `nthTry` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** how often have we retried

### stateActionHandler

#### Parameters

*   `fetch` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** executes the fetch operation
*   `url` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | [URL](https://developer.mozilla.org/docs/Web/API/URL/URL))** 
*   `fetchOptions` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
*   `postprocess` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** 
*   `stateActions` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**  (optional, default `defaultStateActions`)
*   `reporter` **[RequestReporter](#requestreporter)** 

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Response](https://developer.mozilla.org/docs/Web/Guide/HTML/HTML5)>** from fetch

### MIN_WAIT_MSECS

Minimum wait time in msecs.

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

### MAX_RETRIES

Max # of wait retries.

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

### waitDecide

Decide about the time to wait for a retry.

*   only retry [MAX_RETRIES](#max_retries) times
*   when waiting wait at least [MIN_WAIT_MSECS](#min_wait_msecs)

#### Parameters

*   `millisecondsToWait` **Integer** ## of milliseconds to wait before retry
*   `rateLimitRemaining` **Integer** parsed from "x-ratelimit-remaining" header
*   `nthTry` **Integer** how often have we retried the request already
*   `response` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** as returned from fetch

Returns **Integer** milliseconds to wait for next try or < 0 to deliver current response

### rateLimit

*   **See**: <https://auth0.com/docs/policies/rate-limit-policy>
*   **See**: <https://developer.github.com/v3/#rate-limiting>
*   **See**: <https://opensource.zalando.com/restful-api-guidelines/#153>

Waits and retries after rate limit reset time has reached.

#### Parameters

*   `response` **[Response](https://developer.mozilla.org/docs/Web/Guide/HTML/HTML5)** 
*   `nthTry` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
*   `reporter` **[RequestReporter](#requestreporter)** 

Returns **[HandlerResult](#handlerresult)** 

### retryTimes

Increasing delay for each retry

### retryAction

Try 3 times with a delay.

#### Parameters

*   `response` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
*   `nthTry` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

# install

With [npm](http://npmjs.org) do:

```shell
npm install fetch-rate-limit-util
```

# license

BSD-2-Clause
