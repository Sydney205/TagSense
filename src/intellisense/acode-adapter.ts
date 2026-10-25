import { AceCompletionProvider, getAceModeId } from "./ace-completion-provider";
import { languageRegistry } from "./languages";

type AceInputEvents = Pick<Ace.EventEmitter<Ace.EditorEvents>, "on" | "off">;

export class AcodeAdapter {
  private readonly completer = new AceCompletionProvider(languageRegistry);
  private readonly inputEvents: AceInputEvents;
  private applyingEdit = false;

  constructor(private readonly editor: Ace.Editor) {
    this.inputEvents = editor as Ace.Editor & AceInputEvents;
    editor.completers ??= [];
    editor.completers.push(this.completer);
    this.inputEvents.on("input", this.handleInput);
  }

  destroy(): void {
    this.inputEvents.off("input", this.handleInput);
    const completers = this.editor.completers;
    const index = completers?.indexOf(this.completer) ?? -1;
    if (index >= 0) completers.splice(index, 1);
  }

  private readonly handleInput = (): void => {
    if (this.applyingEdit) return;

    const session = this.editor.getSession();
    const cursor = this.editor.getCursorPosition();
    const line = session.getLine(cursor.row);
    const beforeCursor = line.slice(0, cursor.column);
    const engine = languageRegistry.getEngine(getAceModeId(session));

    if (beforeCursor.endsWith("<")) {
      this.editor.execCommand("startAutocomplete");
      return;
    }

    if (beforeCursor.endsWith(">")) {
      const afterCursor = session
        .getLines(cursor.row, session.getLength() - 1)
        .join("\n")
        .slice(cursor.column);
      const closingTag = engine.buildClosingTag(line, cursor.column, afterCursor);
      if (closingTag) {
        this.insertAtCursor(closingTag, cursor);
      }
      return;
    }

    const quote = beforeCursor.slice(-1);
    if ((quote === "\"" || quote === "'") && /=\s*["']$/.test(beforeCursor)) {
      const context = engine.analyzeLine(line, cursor.column - 1);
      if (context.kind === "attribute-value" && line[cursor.column] !== quote) {
        this.insertAtCursor(quote, cursor);
      }
    }
  };

  private insertAtCursor(text: string, cursor: Ace.Point): void {
    this.applyingEdit = true;
    try {
      const session = this.editor.getSession();
      session.insert(cursor, text);
      this.editor.moveCursorToPosition(cursor);
    } finally {
      this.applyingEdit = false;
    }
  }
}
