[![npm](https://img.shields.io/npm/v/fetch-rate-limit-util.svg)](https://www.npmjs.com/package/fetch-rate-limit-util)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript\&label\&labelColor=blue\&color=555555)](https://typescriptlang.org)
[![bundlejs](https://deno.bundlejs.com/?q=fetch-rate-limit-util\&badge=detailed)](https://bundlejs.com/?q=fetch-rate-limit-util)
[![downloads](http://img.shields.io/npm/dm/fetch-rate-limit-util.svg?style=flat-square)](https://npmjs.org/package/fetch-rate-limit-util)
[![GitHub Issues](https://img.shields.io/github/issues/arlac77/fetch-rate-limit-util.svg?style=flat-square)](https://github.com/arlac77/fetch-rate-limit-util/issues)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Farlac77%2Ffetch-rate-limit-util%2Fbadge\&style=flat)](https://actions-badge.atrox.dev/arlac77/fetch-rate-limit-util/goto)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/arlac77/fetch-rate-limit-util/badge.svg)](https://snyk.io/test/github/arlac77/fetch-rate-limit-util)
[![Coverage Status](https://coveralls.io/repos/arlac77/fetch-rate-limit-util/badge.svg)](https://coveralls.io/github/arlac77/fetch-rate-limit-util)

# fetch-rate-limit-util

Handle fetch errors and rate limits and caching.

Waits and retry after rate limit rest time has reached.

*   [auth0 API](https://auth0.com/docs/policies/rate-limit-policy)
*   [github API](https://developer.github.com/v3/#rate-limiting)
*   [Zalando API](https://opensource.zalando.com/restful-api-guidelines/#153)
*   [Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After)

```js
import { stateActionHandler } from "fetch-rate-limit-util";

const response = await stateActionHandler(someURL, options);

// if rate limit occurs waits and retires

```

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

*   [HandlerResult](#handlerresult)
    *   [Properties](#properties)
*   [RequestReporter](#requestreporter)
    *   [Properties](#properties-1)
*   [wait](#wait)
    *   [Parameters](#parameters)
*   [stateActionHandler](#stateactionhandler)
    *   [Parameters](#parameters-1)
*   [calculateRepeatAfter](#calculaterepeatafter)
    *   [Parameters](#parameters-2)
*   [rateLimitHandler](#ratelimithandler)
    *   [Parameters](#parameters-3)
*   [retryTimes](#retrytimes)
*   [retryHandler](#retryhandler)
    *   [Parameters](#parameters-4)
*   [redirectHandler](#redirecthandler)
    *   [Parameters](#parameters-5)
*   [defaultHandler](#defaulthandler)
    *   [Parameters](#parameters-6)
*   [errorHandler](#errorhandler)
    *   [Parameters](#parameters-7)
*   [cacheHandler](#cachehandler)
    *   [Parameters](#parameters-8)
*   [DEFAULT\_MIN\_WAIT\_MSECS](#default_min_wait_msecs)
*   [DEFAULT\_MAX\_RETRIES](#default_max_retries)

## HandlerResult

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

### Properties

*   `url` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** what to fetch next
*   `repeatAfter` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** of milliseconds to wait befor next try
*   `message` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** to report
*   `done` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** op is finished return
*   `response` **[Response](https://developer.mozilla.org/docs/Web/Guide/HTML/HTML5)**&#x20;
*   `postprocess` **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** exec postprocess

## RequestReporter

Function to provide progress report.

Type: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)

### Properties

*   `url` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** to be requested
*   `method` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** http method name
*   `status` **([String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error))** result of the last request
*   `nthTry` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** how often have we retried

## wait

### Parameters

*   `url` **([URL](https://developer.mozilla.org/docs/Web/API/URL/URL) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))**&#x20;
*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;
*   `result` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;

## stateActionHandler

Executes fetch operation and handles response.

### Parameters

*   `url` **([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | [URL](https://developer.mozilla.org/docs/Web/API/URL/URL))**&#x20;
*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;

    *   `options.reporter` **[RequestReporter](#requestreporter)**&#x20;
    *   `options.cache` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?**&#x20;
    *   `options.maxRetries` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?**&#x20;
    *   `options.method` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?**&#x20;
    *   `options.headers` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)?**&#x20;
    *   `options.body` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?**&#x20;
    *   `options.postprocess` **[Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)**&#x20;
    *   `options.stateActions` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Response](https://developer.mozilla.org/docs/Web/Guide/HTML/HTML5)>** from fetch

## calculateRepeatAfter

### Parameters

*   `response` **any**&#x20;

Returns **([number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number) | [undefined](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined))** msecs to wait

## rateLimitHandler

*   **See**: <https://auth0.com/docs/policies/rate-limit-policy>
*   **See**: <https://developer.github.com/v3/#rate-limiting>
*   **See**: <https://opensource.zalando.com/restful-api-guidelines/#153>

Waits and retries after rate limit reset time has reached.

### Parameters

*   `response` **[Response](https://developer.mozilla.org/docs/Web/Guide/HTML/HTML5)** from fetch
*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;
*   `nthTry` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**&#x20;

Returns **[HandlerResult](#handlerresult)**&#x20;

## retryTimes

Retry timeouts with
increasing delay for each retry.
Values in msecs.

## retryHandler

Try several times with a increasing delay.

### Parameters

*   `response` **[Response](https://developer.mozilla.org/docs/Web/Guide/HTML/HTML5)** from fetch
*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;
*   `nthTry` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**&#x20;

Returns **[HandlerResult](#handlerresult)**&#x20;

## redirectHandler

Redirect to given header location.

### Parameters

*   `response` **[Response](https://developer.mozilla.org/docs/Web/Guide/HTML/HTML5)** from fetch
*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;
*   `nthTry` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**&#x20;

Returns **[HandlerResult](#handlerresult)**&#x20;

## defaultHandler

Postprocessing if response is ok.

### Parameters

*   `response` **[Response](https://developer.mozilla.org/docs/Web/Guide/HTML/HTML5)** from fetch
*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;
*   `nthTry` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**&#x20;

Returns **[HandlerResult](#handlerresult)**&#x20;

## errorHandler

No postprocessing.

### Parameters

*   `response` **[Response](https://developer.mozilla.org/docs/Web/Guide/HTML/HTML5)** from fetch
*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;
*   `nthTry` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**&#x20;

Returns **[HandlerResult](#handlerresult)**&#x20;

## cacheHandler

Provide cached data.

### Parameters

*   `response` **[Response](https://developer.mozilla.org/docs/Web/Guide/HTML/HTML5)** from fetch
*   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;
*   `nthTry` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)**&#x20;

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[HandlerResult](#handlerresult)>**&#x20;

## DEFAULT\_MIN\_WAIT\_MSECS

Minimum wait time in msecs.

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## DEFAULT\_MAX\_RETRIES

Max # of retries.

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

# install

With [npm](http://npmjs.org) do:

```shell
npm install fetch-rate-limit-util
```

# license

BSD-2-Clause
