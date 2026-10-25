export type CompletionKind =
  | "text"
  | "tag-name"
  | "closing-tag"
  | "attribute-name"
  | "attribute-value";

export interface AttributeDefinition {
  readonly values?: readonly string[];
  readonly type?: "string" | "boolean" | "number" | "url" | "enum";
}

export interface TagDefinition {
  readonly name: string;
  readonly attributes?: Readonly<Record<string, AttributeDefinition>>;
  readonly void?: boolean;
}

export interface LanguageDefinition {
  readonly id: string;
  readonly aliases: readonly string[];
  readonly caseSensitive?: boolean;
  readonly globalAttributes: readonly string[];
  readonly attributeValues: Readonly<Record<string, readonly string[]>>;
  readonly tags: readonly TagDefinition[];
  readonly voidTags: readonly string[];
}

export interface ParseContext {
  readonly kind: CompletionKind;
  readonly tagName?: string;
  readonly tagPrefix: string;
  readonly attributeName?: string;
  readonly attributePrefix: string;
  readonly attributeValuePrefix?: string;
  readonly closingTag: boolean;
  readonly selfClosing: boolean;
  readonly insideTag: boolean;
}

const TEXT_CONTEXT: ParseContext = {
  kind: "text",
  tagPrefix: "",
  attributePrefix: "",
  closingTag: false,
  selfClosing: false,
  insideTag: false,
};

export class TagSenseEngine {
  private readonly tags = new Map<string, TagDefinition>();
  private readonly tagAttributes = new Map<
    string,
    ReadonlyMap<string, AttributeDefinition>
  >();
  private readonly voidTags: Set<string>;
  private readonly globalAttributes: readonly string[];
  private readonly attributeValues: ReadonlyMap<string, readonly string[]>;
  private readonly normalize: (value: string) => string;

  constructor(readonly language: LanguageDefinition) {
    this.normalize = language.caseSensitive
      ? (value) => value
      : (value) => value.toLowerCase();

    for (const tag of language.tags) {
      const tagKey = this.normalize(tag.name);
      this.tags.set(tagKey, tag);
      this.tagAttributes.set(
        tagKey,
        new Map(
          Object.entries(tag.attributes ?? {}).map(([name, definition]) => [
            this.normalize(name),
            definition,
          ]),
        ),
      );
    }
    this.voidTags = new Set(language.voidTags.map(this.normalize));
    this.globalAttributes = language.globalAttributes;
    this.attributeValues = new Map(
      Object.entries(language.attributeValues).map(([name, values]) => [
        this.normalize(name),
        values,
      ]),
    );
  }

  analyzeLine(line: string, cursor: number): ParseContext {
    if (!Number.isInteger(cursor) || cursor < 0 || cursor > line.length) {
      return TEXT_CONTEXT;
    }

    const start = findOpenTagStart(line, cursor);
    if (start < 0) return TEXT_CONTEXT;

    const rawTag = line.slice(start, cursor);
    const tagMatch = /^\s*<\s*(\/?)\s*([^\s/>]*)/.exec(rawTag);
    if (!tagMatch) return TEXT_CONTEXT;

    const closingTag = tagMatch[1] === "/";
    const tagPrefix = tagMatch[2] ?? "";
    const remainder = rawTag.slice(tagMatch[0].length);
    const selfClosing = /\/\s*$/.test(rawTag);

    if (closingTag) {
      return {
        kind: "closing-tag",
        tagName: tagPrefix || undefined,
        tagPrefix,
        attributePrefix: "",
        closingTag: true,
        selfClosing: false,
        insideTag: true,
      };
    }

    if (!tagPrefix || !remainder) {
      return {
        kind: "tag-name",
        tagName: tagPrefix || undefined,
        tagPrefix,
        attributePrefix: "",
        closingTag: false,
        selfClosing,
        insideTag: true,
      };
    }

    const valueMatch =
      /(?:^|\s)([^\s=/>]+)\s*=\s*(?:"([^"]*)|'([^']*)|([^\s>]*))?$/.exec(
        remainder,
      );
    if (valueMatch) {
      return {
        kind: "attribute-value",
        tagName: tagPrefix,
        tagPrefix,
        attributeName: valueMatch[1],
        attributePrefix: "",
        attributeValuePrefix:
          valueMatch[2] ?? valueMatch[3] ?? valueMatch[4] ?? "",
        closingTag: false,
        selfClosing,
        insideTag: true,
      };
    }

    const attributeMatch = /\s+([^\s=/>]*)$/.exec(remainder);
    if (attributeMatch) {
      return {
        kind: "attribute-name",
        tagName: tagPrefix,
        tagPrefix,
        attributePrefix: attributeMatch[1],
        closingTag: false,
        selfClosing,
        insideTag: true,
      };
    }

    return {
      kind: "text",
      tagName: tagPrefix,
      tagPrefix,
      attributePrefix: "",
      closingTag: false,
      selfClosing,
      insideTag: true,
    };
  }

  getTagSuggestions(prefix = "", closing = false): string[] {
    const normalizedPrefix = this.normalize(prefix);
    return [...this.tags.values()]
      .filter((tag) => {
        const name = this.normalize(tag.name);
        return (
          name.startsWith(normalizedPrefix) &&
          (!closing || (!this.voidTags.has(name) && tag.void !== true))
        );
      })
      .map((tag) => tag.name)
      .sort((a, b) => a.localeCompare(b));
  }

  getAttributeSuggestions(tagName: string | undefined, prefix = ""): string[] {
    const normalizedPrefix = this.normalize(prefix);
    const tag = tagName ? this.tags.get(this.normalize(tagName)) : undefined;
    const available = new Set<string>(this.globalAttributes);

    for (const attribute of Object.keys(tag?.attributes ?? {})) {
      available.add(attribute);
    }

    return [...available]
      .filter((attribute) => this.normalize(attribute).startsWith(normalizedPrefix))
      .sort((a, b) => a.localeCompare(b));
  }

  getAttributeValueSuggestions(
    tagName: string,
    attributeName: string,
    prefix = "",
  ): string[] {
    const tag = this.tags.get(this.normalize(tagName));
    const attributeKey = this.normalize(attributeName);
    const attributeDefinition = tag
      ? this.tagAttributes.get(this.normalize(tagName))?.get(attributeKey)
      : undefined;
    const candidates = new Set([
      ...(attributeDefinition?.values ?? []),
      ...(this.attributeValues.get(attributeKey) ?? []),
    ]);
    const normalizedPrefix = this.normalize(prefix);

    return [...candidates]
      .filter((value) => this.normalize(value).startsWith(normalizedPrefix))
      .sort((a, b) => a.localeCompare(b));
  }

  buildClosingTag(
    line: string,
    cursor: number,
    textAfterCursor = "",
  ): string | null {
    if (cursor < 1 || cursor > line.length || line[cursor - 1] !== ">") {
      return null;
    }

    const completedTag =
      /<([A-Za-z][A-Za-z0-9:._-]*)(?:\s+(?:[^"'<>]|"[^"]*"|'[^']*')*)?\s*>$/.exec(
        line.slice(0, cursor),
      );
    if (!completedTag) return null;

    const tagName = completedTag[1];
    const normalizedName = this.normalize(tagName);
    if (
      this.voidTags.has(normalizedName) ||
      this.tags.get(normalizedName)?.void === true ||
      /\/\s*>$/.test(line.slice(0, cursor))
    ) {
      return null;
    }

    const closingTag = new RegExp(
      `<\\/\\s*${escapeRegExp(tagName)}\\s*>`,
      this.language.caseSensitive ? "" : "i",
    );
    if (closingTag.test(textAfterCursor)) return null;

    return `</${tagName}>`;
  }
}

function findOpenTagStart(line: string, cursor: number): number {
  let activeTag = -1;
  let quote = "";
  let inComment = false;

  for (let index = 0; index < cursor; index += 1) {
    if (inComment) {
      if (line.startsWith("-->", index)) {
        inComment = false;
        index += 2;
      }
      continue;
    }

    if (!quote && line.startsWith("<!--", index)) {
      inComment = true;
      index += 3;
      activeTag = -1;
      continue;
    }

    const character = line[index];
    if (quote) {
      if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "<") {
      activeTag = index;
    } else if (character === ">") {
      activeTag = -1;
    }
  }

  return activeTag;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
