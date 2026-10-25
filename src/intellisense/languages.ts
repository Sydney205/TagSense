import { TagSenseEngine, type AttributeDefinition, type LanguageDefinition, type TagDefinition } from "./engine";

const COMMON_GLOBAL_ATTRIBUTES = [
  "accesskey",
  "autocapitalize",
  "autofocus",
  "class",
  "contenteditable",
  "data-*",
  "dir",
  "draggable",
  "hidden",
  "id",
  "lang",
  "role",
  "slot",
  "spellcheck",
  "style",
  "tabindex",
  "title",
  "translate",
  "aria-label",
  "aria-hidden",
] as const;

const HTML_VOID_TAGS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
] as const;

const stringAttribute: AttributeDefinition = { type: "string" };
const booleanAttribute: AttributeDefinition = { type: "boolean" };
const numberAttribute: AttributeDefinition = { type: "number" };

function tag(
  name: string,
  attributes: Readonly<Record<string, AttributeDefinition>> = {},
): TagDefinition {
  return { name, attributes, void: HTML_VOID_TAGS.includes(name as (typeof HTML_VOID_TAGS)[number]) };
}

const HTML_TAGS = [
  "a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo",
  "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup",
  "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed",
  "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6",
  "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "label",
  "legend", "li", "link", "main", "map", "mark", "menu", "meta", "meter", "nav", "noscript",
  "object", "ol", "optgroup", "option", "output", "p", "picture", "portal", "pre", "progress", "q",
  "rp", "rt", "ruby", "s", "samp", "script", "search", "section", "select", "slot", "small",
  "source", "span", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template",
  "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video",
  "wbr",
] as const;

const HTML_ATTRIBUTES: Readonly<Record<string, Readonly<Record<string, AttributeDefinition>>>> = {
  a: {
    href: { type: "url" },
    target: { type: "enum", values: ["_blank", "_self", "_parent", "_top"] },
    rel: { type: "enum", values: ["alternate", "author", "external", "nofollow", "noopener", "noreferrer"] },
    download: booleanAttribute,
    hreflang: stringAttribute,
    ping: stringAttribute,
  },
  button: {
    type: { type: "enum", values: ["button", "submit", "reset"] },
    disabled: booleanAttribute,
    name: stringAttribute,
    value: stringAttribute,
    formaction: stringAttribute,
  },
  form: {
    action: { type: "url" },
    method: { type: "enum", values: ["get", "post", "dialog"] },
    enctype: { type: "enum", values: ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"] },
    autocomplete: { type: "enum", values: ["on", "off"] },
    novalidate: booleanAttribute,
  },
  img: {
    src: { type: "url" },
    alt: stringAttribute,
    width: numberAttribute,
    height: numberAttribute,
    loading: { type: "enum", values: ["eager", "lazy"] },
    decoding: { type: "enum", values: ["async", "auto", "sync"] },
    srcset: stringAttribute,
  },
  input: {
    type: {
      type: "enum",
      values: ["button", "checkbox", "email", "file", "hidden", "number", "password", "radio", "search", "submit", "text", "url"],
    },
    name: stringAttribute,
    value: stringAttribute,
    placeholder: stringAttribute,
    checked: booleanAttribute,
    disabled: booleanAttribute,
    required: booleanAttribute,
    min: stringAttribute,
    max: stringAttribute,
    step: stringAttribute,
    autocomplete: stringAttribute,
  },
  link: {
    rel: { type: "enum", values: ["alternate", "author", "icon", "manifest", "modulepreload", "stylesheet"] },
    href: { type: "url" },
    media: stringAttribute,
    type: stringAttribute,
    crossorigin: { type: "enum", values: ["anonymous", "use-credentials"] },
  },
  script: {
    src: { type: "url" },
    type: { type: "enum", values: ["module", "text/javascript", "application/json"] },
    async: booleanAttribute,
    defer: booleanAttribute,
    crossorigin: { type: "enum", values: ["anonymous", "use-credentials"] },
  },
  select: {
    name: stringAttribute,
    multiple: booleanAttribute,
    required: booleanAttribute,
    disabled: booleanAttribute,
    size: numberAttribute,
  },
  textarea: {
    name: stringAttribute,
    rows: numberAttribute,
    cols: numberAttribute,
    placeholder: stringAttribute,
    required: booleanAttribute,
    disabled: booleanAttribute,
  },
};

const HTML_ATTRIBUTE_VALUES: Readonly<Record<string, readonly string[]>> = {
  type: ["button", "checkbox", "email", "file", "hidden", "number", "password", "radio", "reset", "search", "submit", "text", "url"],
  rel: ["alternate", "author", "external", "icon", "nofollow", "noopener", "noreferrer", "stylesheet"],
  target: ["_blank", "_self", "_parent", "_top"],
  loading: ["eager", "lazy"],
  decoding: ["async", "auto", "sync"],
  crossorigin: ["anonymous", "use-credentials"],
  autocomplete: ["off", "on"],
  method: ["dialog", "get", "post"],
};

const htmlTags = HTML_TAGS.map((name) => tag(name, HTML_ATTRIBUTES[name] ?? {}));

export const htmlLanguage: LanguageDefinition = {
  id: "html",
  aliases: ["html", "htm"],
  globalAttributes: COMMON_GLOBAL_ATTRIBUTES,
  attributeValues: HTML_ATTRIBUTE_VALUES,
  tags: htmlTags,
  voidTags: HTML_VOID_TAGS,
};

export const jsxLanguage: LanguageDefinition = {
  ...htmlLanguage,
  id: "jsx",
  aliases: ["jsx", "tsx", "javascriptreact", "typescriptreact"],
  globalAttributes: [
    ...COMMON_GLOBAL_ATTRIBUTES,
    "className", "htmlFor", "key", "ref", "onClick", "onChange", "onSubmit",
  ],
  tags: [
    ...htmlTags,
    tag("Fragment"),
    tag("Component", {
      className: stringAttribute,
      key: stringAttribute,
      ref: stringAttribute,
      onClick: stringAttribute,
      onChange: stringAttribute,
    }),
  ],
};

const SVG_TAG_NAMES = [
  "svg", "a", "animate", "animateMotion", "animateTransform", "circle", "clipPath", "defs",
  "desc", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite",
  "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feOffset", "feSpecularLighting",
  "feTile", "feTurbulence", "filter", "foreignObject", "g", "image", "line", "linearGradient",
  "marker", "mask", "metadata", "path", "pattern", "polygon", "polyline", "radialGradient",
  "rect", "script", "stop", "style", "text", "textPath", "title", "tspan", "use", "view",
] as const;

const SVG_ATTRIBUTES = [
  "viewBox", "xmlns", "fill", "fillRule", "fillOpacity", "stroke", "strokeWidth", "strokeLinecap",
  "strokeLinejoin", "strokeDasharray", "strokeDashoffset", "strokeOpacity", "d", "x", "y", "x1",
  "x2", "y1", "y2", "cx", "cy", "r", "rx", "ry", "width", "height", "points", "transform",
  "preserveAspectRatio", "opacity", "clipPath", "mask", "filter", "gradientUnits", "offset",
] as const;

const svgTags = SVG_TAG_NAMES.map((name) => tag(name, Object.fromEntries(
  SVG_ATTRIBUTES.map((attribute) => [attribute, stringAttribute]),
)));

export const svgLanguage: LanguageDefinition = {
  id: "svg",
  aliases: ["svg"],
  globalAttributes: [...COMMON_GLOBAL_ATTRIBUTES, ...SVG_ATTRIBUTES],
  attributeValues: {
    ...HTML_ATTRIBUTE_VALUES,
    fill: ["none", "currentColor", "transparent"],
    stroke: ["none", "currentColor", "transparent"],
    strokeLinecap: ["butt", "round", "square"],
    strokeLinejoin: ["arcs", "bevel", "miter", "miter-clip", "round"],
    fillRule: ["evenodd", "nonzero"],
    gradientUnits: ["objectBoundingBox", "userSpaceOnUse"],
  },
  tags: svgTags,
  voidTags: [],
};

const XML_TAG_NAMES = [
  "xml", "html", "head", "body", "title", "meta", "link", "script", "style", "div", "span", "p",
  "a", "img", "br", "hr", "ul", "ol", "li", "table", "tr", "td", "th", "form", "input",
  "button", "section", "article", "header", "footer", "main", "svg",
] as const;

export const xmlLanguage: LanguageDefinition = {
  id: "xml",
  aliases: ["xml", "xhtml", "xsl", "xslt"],
  caseSensitive: true,
  globalAttributes: ["id", "class", "style", "lang", "dir", "xmlns", "version", "encoding"],
  attributeValues: {},
  tags: XML_TAG_NAMES.map((name) => tag(name, {
    id: stringAttribute,
    name: stringAttribute,
    type: stringAttribute,
    value: stringAttribute,
  })),
  voidTags: [],
};

const VUE_DIRECTIVES = [
  "v-bind", "v-on", "v-model", "v-if", "v-else", "v-else-if", "v-for", "v-show", "v-html",
  "v-text", "v-slot", "v-pre", "v-once", "v-cloak",
];

export const vueLanguage: LanguageDefinition = {
  ...htmlLanguage,
  id: "vue",
  aliases: ["vue"],
  globalAttributes: [...COMMON_GLOBAL_ATTRIBUTES, ...VUE_DIRECTIVES],
  tags: [
    ...htmlTags,
    tag("template"),
    tag("component", { is: stringAttribute, ...Object.fromEntries(VUE_DIRECTIVES.map((name) => [name, stringAttribute])) }),
    tag("slot", { name: stringAttribute, ...Object.fromEntries(VUE_DIRECTIVES.map((name) => [name, stringAttribute])) }),
    tag("transition"),
    tag("transition-group"),
    tag("keep-alive"),
    tag("teleport", { to: stringAttribute, disabled: booleanAttribute }),
    tag("suspense"),
  ],
};

export const languageDefinitions: readonly LanguageDefinition[] = [
  htmlLanguage,
  jsxLanguage,
  svgLanguage,
  xmlLanguage,
  vueLanguage,
];

export class LanguageRegistry {
  private readonly languages = new Map<string, LanguageDefinition>();
  private readonly engines = new WeakMap<LanguageDefinition, TagSenseEngine>();

  constructor(definitions: readonly LanguageDefinition[] = languageDefinitions) {
    for (const definition of definitions) {
      for (const alias of [definition.id, ...definition.aliases]) {
        this.languages.set(alias.toLowerCase(), definition);
      }
    }
  }

  get(languageId: string | undefined): LanguageDefinition {
    const normalized = (languageId ?? "").toLowerCase().replace(/^ace\/mode\//, "");
    return this.languages.get(normalized) ?? htmlLanguage;
  }

  getEngine(languageId: string | undefined): TagSenseEngine {
    const language = this.get(languageId);
    let engine = this.engines.get(language);
    if (!engine) {
      engine = new TagSenseEngine(language);
      this.engines.set(language, engine);
    }
    return engine;
  }
}

export const languageRegistry = new LanguageRegistry();
