# Markonce

A minimal markup generator that converts nested selectors into HTML and CSS stubs.

## Usage

1. Create a schema.txt file with nested selectors (indented with 2 spaces)
2. Run `node mark.js` to generate index.html and styles.css
3. Selectors used once become IDs, multiple uses become classes

## Example

```txt
header
  logo
  nav
    link
    link
```

Generates corresponding HTML with IDs/classes and empty CSS rules.
