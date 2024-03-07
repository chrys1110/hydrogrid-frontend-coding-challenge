/**
 * Helper to show code completion for CSS in some editors.
 * Does nothing other than concatenating the input to a string.
 *
 * @see https://marketplace.visualstudio.com/items?itemName=styled-components.vscode-styled-components
 *
 * @usage
 *
 * ```ts
 * const styles = css`
 *   .mybutton {
 *     border: 1px solid red;
 *   }
 * `;
 * ```
 */
export function css(template: TemplateStringsArray, ...values: (string | number)[]) {
  const output: (string | number)[] = [template[0]];
  values.forEach((value, index) => {
    output.push(value, template[index + 1]);
  });

  return output.join('');
}
