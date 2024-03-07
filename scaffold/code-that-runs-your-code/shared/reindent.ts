/**
 * Helper function to embed multiline strings in indented code without keeping the whitespace.
 *
 * @example
 * ```
 * const someValue = `"example`";
 * const template = reindent`
 *   if (condition == ${someValue}) {
 *     doSomeAction();
 *   }
 * `;
 * console.log(template.split('\n'))
 * // => 'if (condition == "example") {\n  doSomeAction();\n}'
 * ```
 */
export function reindent(
  templateArray: TemplateStringsArray,
  ...placeholders: (string | number | readonly (string | false | null | undefined)[])[]
): string {
  let templateParts = [...templateArray];

  // Trim trailing whitespace of last template part
  templateParts[templateParts.length - 1] = templateParts[templateParts.length - 1].replace(/\n[ \t]*$/, '');

  // Find shortest indentation
  const indentationPattern = /\n([ \t]+)(?=\S|$)/g;
  let indentation = '';

  for (const template of templateParts) {
    for (const [, leadingWhitespace] of template.matchAll(indentationPattern)) {
      if (!indentation || leadingWhitespace.length < indentation.length) {
        indentation = leadingWhitespace;
      }
    }
  }

  const indentationAfterNewline = new RegExp(`\n${indentation}`, 'g');
  const endOfTemplateWhitespace = /\n([ \t]*)(?:[^\n]*?)$/;

  // Remove indentation from all template lines
  templateParts = templateParts.map(part => part.replace(indentationAfterNewline, '\n'));

  // Capture indentation at the end of the first template
  let currentIndent = templateParts[0].match(endOfTemplateWhitespace)?.[1] ?? '';

  // Trim leading whitespace of first template part
  templateParts[0] = templateParts[0].replace(/^[ \t]*\n/, '');

  const result: (string | number)[] = [templateParts[0]];
  placeholders.forEach((value, index) => {
    if (Array.isArray(value)) {
      // Remove empty lines from passed-in arrays
      value = value.filter(item => item || item === '').join('\n');
    }

    // Add indent of previous template to array lines
    value = String(value).replace(/\n/g, '\n' + currentIndent);

    const nextPart = templateParts[index + 1];
    result.push(value, nextPart);

    currentIndent = nextPart.match(endOfTemplateWhitespace)?.[1] ?? '';
  });

  return result.join('');
}
