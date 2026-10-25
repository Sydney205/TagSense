import assert from "node:assert/strict";
import test from "node:test";
import { TagSenseEngine } from "../src/intellisense/engine";
import { htmlLanguage, languageRegistry, vueLanguage, xmlLanguage } from "../src/intellisense/languages";

test("suggests tag names only inside an opening tag name", () => {
  const engine = new TagSenseEngine(htmlLanguage);
  assert.equal(engine.analyzeLine("some text <", 11).kind, "tag-name");
  assert.deepEqual(engine.getTagSuggestions("di"), ["dialog", "div"]);
  assert.equal(engine.analyzeLine("some text", 9).kind, "text");
});

test("parses attributes and values without confusing quoted tag content", () => {
  const engine = new TagSenseEngine(htmlLanguage);
  const attributeLine = '<a title="1 > 0" tar';
  const attribute = engine.analyzeLine(attributeLine, attributeLine.length);
  assert.equal(attribute.kind, "attribute-name");
  assert.equal(attribute.tagName, "a");
  assert.equal(attribute.attributePrefix, "tar");

  const value = engine.analyzeLine('<a target="_b', 13);
  assert.equal(value.kind, "attribute-value");
  assert.deepEqual(engine.getAttributeValueSuggestions("a", "target", "_b"), ["_blank"]);
});

test("suggests global and tag-specific attributes", () => {
  const engine = new TagSenseEngine(htmlLanguage);
  assert.ok(engine.getAttributeSuggestions("input", "typ").includes("type"));
  assert.ok(engine.getAttributeSuggestions("input", "cla").includes("class"));
  assert.equal(engine.getAttributeSuggestions("div", "typ").includes("type"), false);
});

test("never closes void or self-closing tags", () => {
  const engine = new TagSenseEngine(htmlLanguage);
  assert.equal(engine.buildClosingTag("<img>", 5), null);
  assert.equal(engine.buildClosingTag("<input type=text>", 17), null);
  assert.equal(engine.buildClosingTag("<Widget />", 10), null);
  assert.equal(engine.buildClosingTag("<br/>", 5), null);
});

test("adds matching close tags and avoids duplicate closes ahead", () => {
  const engine = new TagSenseEngine(htmlLanguage);
  assert.equal(engine.buildClosingTag("<section>", 9), "</section>");
  assert.equal(engine.buildClosingTag("<section>", 9, " content </section>"), null);
  assert.equal(engine.buildClosingTag("</section>", 10), null);
});

test("does not treat comments or text as completion contexts", () => {
  const engine = new TagSenseEngine(htmlLanguage);
  assert.equal(engine.analyzeLine("<!-- <div", 9).kind, "text");
  assert.equal(engine.analyzeLine("<div>text", 9).kind, "text");
});

test("uses language-specific tag and attribute casing", () => {
  const xml = new TagSenseEngine(xmlLanguage);
  assert.ok(xml.getTagSuggestions("ht").includes("html"));
  assert.deepEqual(xml.getTagSuggestions("HT"), []);
  assert.equal(languageRegistry.get("ace/mode/vue"), vueLanguage);

  const jsx = new TagSenseEngine(languageRegistry.get("jsx"));
  assert.ok(jsx.getAttributeSuggestions("Component", "onC").includes("onClick"));
});

test("does not close tags with malformed or incomplete delimiters", () => {
  const engine = new TagSenseEngine(htmlLanguage);
  assert.equal(engine.buildClosingTag("<div", 4), null);
  assert.equal(engine.buildClosingTag("<div attr='unterminated>", 24), null);
});
