import test from "ava";
import { mkdir } from "node:fs/promises";
import levelup from "levelup";
import leveldown from "leveldown";
import { ETagCacheLevelDB, rawTagData } from "etag-cache-leveldb";

test("header store load", async t => {
  const dir = new URL("../build/cache1", import.meta.url).pathname;
  await mkdir(dir, { recursive: true });

  const db = await levelup(leveldown(dir));

  const cache = new ETagCacheLevelDB(db);

  const url = "https://api.github.com/";

  const response = await fetch(url);

  const etag = response.headers.get("etag");

  await cache.storeResponse(response);

  const headers = {};

  t.true(await cache.addHeaders(url, headers));

  t.is(rawTagData(headers["If-None-Match"]), rawTagData(etag));

  const response2 = await fetch(url, { headers });

  t.is(response2.status, 304);

  const cachedResponse = await cache.loadResponse(response2);

  t.is(cachedResponse.status, 200);
  t.is(cachedResponse.statusText, "OK from cache");
  //t.is(cachedResponse.url, url);
  t.true(cachedResponse.ok);

  const json = await cachedResponse.json();

  t.is(json.current_user_url, "https://api.github.com/user");

  t.is(cache.statistics.numberOfLoadedRequests,1);
  t.true(cache.statistics.numberOfLoadedBytes > 1000);
  t.is(cache.statistics.numberOfStoredRequests,1);
  t.true(cache.statistics.numberOfStoredBytes > 1000);
});

test("load empty cache", async t => {
  const dir = new URL("../build/cache2", import.meta.url).pathname;
  await mkdir(dir, { recursive: true });

  const db = await levelup(leveldown(dir));

  const cache = new ETagCacheLevelDB(db);

  const url = "https://api.github.com/";

  const response = await fetch(url);
  const cachedResponse = await cache.loadResponse(response);
  t.false(cachedResponse.ok);
});