import type { LanguageRegistry } from "./languages";

export function getAceModeId(session: Ace.EditSession): string | undefined {
  return (session.getMode() as Ace.SyntaxMode & { $id?: string }).$id;
}

export class AceCompletionProvider implements Ace.Completer {
  readonly id = "tagsense";
  readonly triggerCharacters = ["<", " ", "=", "\"", "'"];

  constructor(private readonly registry: LanguageRegistry) {}

  getCompletions(
    _editor: Ace.Editor,
    session: Ace.EditSession,
    position: Ace.Point,
    _prefix: string,
    callback: Ace.CompleterCallback,
  ): void {
    const engine = this.registry.getEngine(getAceModeId(session));
    const line = session.getLine(position.row);
    const context = engine.analyzeLine(line, position.column);

    let values: string[] = [];
    let meta = "";
    if (context.kind === "tag-name") {
      values = engine.getTagSuggestions(context.tagPrefix);
      meta = "tag";
    } else if (context.kind === "closing-tag") {
      values = engine.getTagSuggestions(context.tagPrefix, true);
      meta = "closing tag";
    } else if (context.kind === "attribute-name") {
      values = engine.getAttributeSuggestions(context.tagName, context.attributePrefix);
      meta = "attribute";
    } else if (
      context.kind === "attribute-value" &&
      context.tagName &&
      context.attributeName
    ) {
      values = engine.getAttributeValueSuggestions(
        context.tagName,
        context.attributeName,
        context.attributeValuePrefix,
      );
      meta = "value";
    }

    callback(
      null,
      values.map((value) => ({
        caption: value,
        value,
        meta,
        score: meta === "tag" || meta === "closing tag" ? 1000 : 900,
      })),
    );
  }

}
