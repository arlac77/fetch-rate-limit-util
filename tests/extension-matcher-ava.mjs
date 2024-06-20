import test from "ava";
import { ContentEntry } from "content-entry";
import { nameExtensionMatcher } from "content-entry-transform";

test("nameExtensionMatcher", async t => {
  const m = nameExtensionMatcher([".txt"]);

  t.true(m(new ContentEntry("aName.txt")));
  t.false(m(new ContentEntry("aName.txt2")));
  t.false(m(new ContentEntry("aNametxt")));
});

test("nameExtensionMatcher multiple", async t => {
  const m = nameExtensionMatcher([".txt", ".json"]);

  t.true(m(new ContentEntry("aName.txt")));
  t.true(m(new ContentEntry("aName.json")));
  t.false(m(new ContentEntry("aName.txt2")));
  t.false(m(new ContentEntry("aNametxt")));
});
