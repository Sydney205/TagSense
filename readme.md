<div align="center">
  <img src="icon.png" width="120" height="120" alt="TagSense Logo">
  <h1>TagSense</h1>
  <p><b>Mobile-first tag intelligence for Acode.</b></p>
</div>

TagSense is an Acode plugin for fast, context-aware markup completion on mobile devices. It helps developers write cleaner HTML, JSX, SVG, XML, and Vue templates with intelligent tag suggestions, matching close-tag insertion, and attribute/value completion without interrupting the flow of typing.

---

## Current project status

TagSense is now past the initial prototype stage and has a working core feature set with automated validation. The plugin covers the primary mobile editing workflows expected from a markup helper:

- tag-name suggestions
- closing-tag insertion
- void tag protection
- attribute name suggestions
- attribute value completion
- multi-language support for common markup profiles

This makes it suitable for active use in the core Acode editing workflow, while still leaving room for more advanced framework-specific completion.

---

## Features

- Smart tag completion for opening and closing tags
- Automatic close-tag insertion with duplicate protection
- Void tag awareness for tags like `<img>`, `<br>`, `<input>`, and `<meta>`
- Attribute suggestions for global and tag-specific HTML attributes
- Value suggestions for common attributes like `type`, `rel`, `target`, and `loading`
- Support for multiple markup environments:
  - HTML / HTM
  - JSX / TSX
  - SVG
  - XML / XHTML
  - Vue templates
- Case-aware behavior for languages that require it, such as XML
- Lightweight design tuned for mobile keyboard input and editor responsiveness

---

## Supported languages

TagSense currently includes language profiles for:

- HTML
- JSX and TSX
- SVG
- XML
- Vue

The language registry is designed to be extensible, so more syntax-specific completions can be added without changing the core engine.

---

## Installation

### From source

1. Clone the repository:
   ```bash
   git clone https://github.com/Sydney205/TagSense.git
   cd TagSense
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. The build creates a packaged plugin archive (`plugin.zip`) in the project root.

5. Open Acode on your Android device, go to:
   - Settings
   - Plugins
   - Install Plugin

6. Select the generated `plugin.zip` and enable it.

---

## Usage

### Tag suggestions

Type `<` and TagSense will suggest valid tag names based on the current language context.

### Close-tag insertion

Typing a complete tag like:

```html
<section>
```

can automatically insert the closing tag:

```html
<section></section>
```

with the cursor placed inside the element, ready for content.

### Void tag protection

Self-closing or void elements are protected from accidental closing-tag duplication:

```html
<img>
<br>
<input>
<meta>
```

### Attribute completion

After typing a tag name, TagSense can suggest valid attributes such as:

```html
<a href="" target="_blank">
<img src="" alt="">
```

and provide value suggestions where appropriate.

---

## Development

Project scripts:

```bash
npm test
npm run build
npm run typecheck
```

The project includes a small automated test suite covering:
- tag suggestions
- attribute parsing
- close-tag insertion
- void-tag behavior
- language-specific completions

---

## Roadmap

Current focus areas are practical and grounded in the working feature set:

- expand value completion coverage for more common attributes
- improve framework-specific suggestions
- refine mobile UX and editor interaction behavior
- continue extending language profiles and edge-case parsing

---

## Contributing

Contributions, issues, and pull requests are welcome. Please open an issue or submit a patch via the GitHub repository:

https://github.com/Sydney205/TagSense

---

## License

MIT License © Sydney205
