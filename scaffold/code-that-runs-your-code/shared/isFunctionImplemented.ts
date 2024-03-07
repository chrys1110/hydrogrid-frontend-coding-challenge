export function isFunctionImplemented(fn: (...args: any[]) => any, placeholderCode: RegExp | string = '') {
  const sourceCode = normalizeFunctionSourceCode(fn);
  // console.log(sourceCode);

  if (placeholderCode instanceof RegExp) {
    return !placeholderCode.test(sourceCode);
  }

  return sourceCode.replace(/\s+/g, '') !== placeholderCode.replace(/\s+/g, '');
}

function normalizeFunctionSourceCode(fn: Function) {
  // Get function body
  let src = fn.toString().replace(/^function[^{]+\{\s*|\s*\}$/g, '');

  // Remove comments
  src = src.replace(/\/\/[^\n]+?|\/\*.+?\*\//g, ' ');

  if (src.includes('_jsxDEV(')) {
    // Remove react debug info
    src = src.replace(/,\s*\{\s*fileName:\s*_jsxFileName,\s*lineNumber:\s*\d+,\s*columnNumber:\s*\d+\s*\}\n?/g, '');

    // Format react calls (_jsxDEV) to component source (<Component ...props />)
    src = src
      .replace(/_jsxDEV\((?:(\w+)|"(\w+)"),[ \t]*\{/g, '<$1$2')
      .replace(/\}, void 0, (?:true|false), this\)/g, '>')
      .replace(/\n(\s*)children:\s*\[\s*</g, '>\n$1<')
      .replace(/\n(\s*)>,(\s*)<(\w+)\n/g, '\n$1/>\n$2<$3\n')
      .replace(/\n(\s*)>\]\n(\s*)>/g, '\n$1/>\n$2</>')
      .replaceAll(/<(\w+)((?:\n\s*(?:\w+:\s*(".+?"|\S+?)),?)+)\n\s*\/?>/g, (_, componentName: string, props: string) => {
        const formattedProps = props.replaceAll(
          /\n\s*(\w+):\s*(?:(".+?")|([^\s,]+)),?/g,
          (_, name, str, other) => `${name}=${str ? str : `{${other}}`} `
        );
        return `<${componentName} ${formattedProps}/>`;
      })
      .replaceAll(/<(\w+)(\s+\w+=(?:".+?"|\S+?))*>((?:\s*<\w+(?:\s+\w+=(?:".+?"|\S+?))*\s*\/>)+)(\s*)<\/>/g, '<$1$2>$3$4</$1>')
      .replace(/^return\s{2,}</, 'return <');
  }

  return src;
}
