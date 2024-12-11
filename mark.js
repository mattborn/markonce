#!/usr/bin/env node

const fs = require('fs')

// Read schema and count selectors
function parseSchema(text) {
  const lines = text.split('\n').filter(line => line.trim())
  const counts = {}
  const structure = []
  let currentIndent = 0
  let currentPath = []

  lines.forEach(line => {
    const indent = line.search(/\S/)
    const name = line.trim()

    // Count selector usage
    counts[name] = (counts[name] || 0) + 1

    // Track nesting
    while (indent <= currentIndent && currentPath.length) {
      currentPath.pop()
      currentIndent -= 2
    }
    currentPath.push(name)
    currentIndent = indent
    structure.push({ path: [...currentPath], name, indent })
  })

  return { counts, structure }
}

// Generate HTML with proper nesting
function generateHTML(structure, counts) {
  let html =
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Generated Page</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n'

  let currentIndent = 0
  let openElements = []

  structure.forEach(({ path, indent, name }) => {
    // Close tags until we reach the correct nesting level
    while (currentIndent > indent) {
      const spaces = '  '.repeat(openElements.length)
      html += `${spaces}</div>\n`
      openElements.pop()
      currentIndent -= 2
    }

    // If we're at root level (indent 0), close all open elements
    if (indent === 0) {
      while (openElements.length) {
        const spaces = '  '.repeat(openElements.length)
        html += `${spaces}</div>\n`
        openElements.pop()
      }
      currentIndent = 0
    }

    // Add new element
    const selector = counts[name] > 1 ? `class="${name}"` : `id="${name}"`
    const spaces = '  '.repeat(openElements.length + 1)
    html += `${spaces}<div ${selector}>\n`
    openElements.push(name)
    currentIndent = indent
  })

  // Close any remaining tags
  while (openElements.length) {
    const spaces = '  '.repeat(openElements.length)
    html += `${spaces}</div>\n`
    openElements.pop()
  }

  html += '</body>\n</html>'
  return html
}

// Generate CSS with single newline between rules
function generateCSS(structure, counts) {
  const selectors = new Set()
  let css = ''

  structure.forEach(({ name }) => {
    const selector = counts[name] > 1 ? `.${name}` : `#${name}`
    if (!selectors.has(selector)) {
      selectors.add(selector)
      css += `${selector} {}\n`
    }
  })

  return css
}

// Main
try {
  const schema = fs.readFileSync('schema.txt', 'utf8')
  const { counts, structure } = parseSchema(schema)

  fs.writeFileSync('index.html', generateHTML(structure, counts))
  fs.writeFileSync('styles.css', generateCSS(structure, counts))

  console.log('Generated index.html and styles.css')
} catch (err) {
  console.error('Error:', err.message)
  process.exit(1)
}
