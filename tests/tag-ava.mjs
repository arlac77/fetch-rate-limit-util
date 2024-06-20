import test from "ava";
import { rawTagData } from "etag-cache-leveldb";

test("rawTagData undefined", t => t.is(rawTagData(undefined), undefined));
test("rawTagData weak", t => t.is(rawTagData('W/"ABC"'), '"ABC"'));
test("rawTagData", t => t.is(rawTagData('"ABC"'), '"ABC"'));
