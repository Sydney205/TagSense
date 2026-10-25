# Acode TypeScript template

TagSense provides context-aware tag, attribute, and attribute-value completion plus smart tag and quote pairing for Acode's Ace editor.

## IntelliSense modules

- `src/intellisense/engine.ts` parses the line at the cursor and provides suggestions/closing-tag decisions without depending on Ace.
- `src/intellisense/languages.ts` contains the HTML, JSX, SVG, XML, and Vue dictionaries and the language registry. Add a `LanguageDefinition` and register it in `languageDefinitions` to add a language.
- `src/intellisense/ace-completion-provider.ts` implements Ace's `Ace.Completer` contract (`getCompletions(editor, session, position, prefix, callback)`).
- `src/intellisense/acode-adapter.ts` installs the completer in `editor.completers`, listens to Ace's `input` event, and uses the session's `getLine`, `getLines`, and `insert` APIs. `destroy()` removes the listener and completer.

The plugin entry point gets Acode's active Ace editor from `window.editor`, creates one adapter at plugin initialization, and disposes it when the plugin unmounts. The provider selects a dictionary from the Ace session mode ID (`session.getMode().$id`), falling back to HTML for unknown modes.

## Development

```sh
npm install
npm run typecheck
npm test
npm run build
```

`npm run dev` watches and serves the packaged plugin on port 3000. In Acode, install it from **Plugins → + → Remote** using `http://<your-ip>:3000/plugin.zip`.

## Scripts

```sh
npm install
npm run dev        # watch, serve on :3000, rebuild plugin.zip
npm run typecheck
npm run build      # typecheck, bundle, write plugin.zip
```

In Acode, install from **Plugins → + → Remote** using:

```
http://<your-ip>:3000/plugin.zip
```
