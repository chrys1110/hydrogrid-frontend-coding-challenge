import { Children as ChildrenUtils, Fragment, ReactElement, ReactNode } from 'react';

// Taken from our own library ¯\_(ツ)_/¯ - please don't steal

const fragmentType = (<Fragment />).type;

type TaggedFunction<T = Function> = T & {
  $$functionName?: string | null;
  $$functionSource: string | undefined;
};

/** Formats rendered JSX as the source code used to render it. */
export function renderJsxElementToSource(nodes: ReactNode, indentation: string): string {
  const lines = [];

  for (const node of ChildrenUtils.toArray(nodes)) {
    if (node === null) {
      lines.push('{null}');
    } else if (typeof node === 'string') {
      const needsToBeEscaped = /^\s|\s$|<|>/m.test(node);
      lines.push(needsToBeEscaped ? `{${JSON.stringify(node)}}` : node);
    } else if (typeof node === 'number') {
      lines.push(`${node}`);
    } else if (isReactElement(node)) {
      const isFragment = node.type === fragmentType;
      const componentName =
        typeof node.type === 'string' ? node.type : isFragment ? 'React.Fragment' : node.type.displayName ?? node.type.name;

      const props: string[] = [];

      const key = typeof node.key === 'string' ? node.key.replace(/^\.\$/, '') : node.key;
      if (typeof key === 'string' && !/^\.|^\s|\s$|\n|<|>/.test(key)) {
        props.push(`key=${JSON.stringify(key)}`);
      } else if (key && !String(key).startsWith('.')) {
        props.push(`key={${JSON.stringify(key).replace(/^"(\.*)"$/, `'$1'`)}}`);
      }

      for (const [name, value] of Object.entries(node.props)) {
        if (name !== 'children') {
          props.push(`${name}=${renderJsxValueToSource(value, indentation)}`);
        }
      }

      const stringifiedProps = props.map(prop => ` ${prop}`).join('');
      const children = node.props.children;

      if (isFragment && !props.length && typeof children === 'string') {
        const stringifiedChildren = /^\s|\s$|<|>/.test(children) ? renderJsxValueToSource(children, indentation) : children;
        lines.push(`<>${stringifiedChildren}</>`);
      } else if (isFragment && !props.length && children) {
        const childrenLines = renderJsxElementToSource(children, indentation).split('\n');
        const stringifiedChildren = childrenLines.map(line => `${indentation}${line}`).join('\n');
        lines.push(`<>\n${stringifiedChildren}\n</>`);
      } else if (children === undefined) {
        lines.push(`<${componentName}${stringifiedProps} />`);
      } else if (typeof children === 'string') {
        const stringifiedChildren = /^\s|\s$|<|>/.test(children) ? renderJsxValueToSource(children, indentation) : children;
        lines.push(`<${componentName}${stringifiedProps}>${stringifiedChildren}</${componentName}>`);
      } else {
        const childrenLines = renderJsxElementToSource(children, indentation).split('\n');
        const stringifiedChildren = childrenLines.map(line => `${indentation}${line}`).join('\n');
        lines.push(`<${componentName}${stringifiedProps}>\n${stringifiedChildren}\n</${componentName}>`);
      }
    } else if (Array.isArray(node)) {
      const children = (nodes as ReactNode[]).map(child => renderJsxElementToSource(child, indentation));
      lines.push(...children);
    } else {
      console.warn('Demo component: Not sure how to render node: ', node);
    }
  }

  return lines.join('\n');
}

function renderJsxValueToSource(value: unknown, indentation: string): string {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  } else {
    return `{${renderValueToSource(value, indentation)}}`;
  }
}

function renderValueToSource(value: unknown, indentation: string): string {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  } else if (isReactElement(value)) {
    return renderJsxElementToSource(value, indentation);
  } else if (typeof value === 'object' && value) {
    const variableName = (value as { $$variable?: string }).$$variable;
    if (variableName) {
      return variableName;
    }

    if (Array.isArray(value)) {
      const renderedElements = value.map(element => renderValueToSource(element, indentation));
      return `[${renderedElements.join(', ')}]`;
    }

    const props = Object.entries(value).map(([key, value]) => {
      return `${key}: ${renderValueToSource(value, indentation)}`;
    });
    return props.length ? `{ ${props.join(', ')} }` : '{}';
  } else if (typeof value === 'function') {
    const func = value as TaggedFunction;
    const functionSource = Function.prototype.toString.call(func);
    const isArrowFunction = func.$$functionName === null || /^\w+\s*=>|^\(\s*\w+\s*(,\s*\w+\s*)+\)\s*=>/.test(functionSource);
    if (isArrowFunction) {
      return func.$$functionSource ?? value.toString();
    } else {
      const functionName = func.$$functionName ?? value.displayName ?? value.name.replace(/^bound /, '');
      return functionName;
    }
  } else {
    // number, null, undefined, boolean
    return String(value);
  }
}

function isReactElement(value: unknown): value is ReactElement {
  return typeof value === 'object' && value != null && 'type' in value && 'props' in value && 'key' in value;
}

/* eslint-disable no-new-wrappers */

/** Utility function to render a value as a variable name when stringifying. */
export function namedVariable<T extends string | number | boolean | object>(name: string, value: T): T {
  let boxedValue: any;

  if (typeof value === 'string') {
    boxedValue = new String(value);
  } else if (typeof value === 'number') {
    boxedValue = new Number(value);
  } else if (typeof value === 'boolean') {
    boxedValue = new Boolean(value);
  } else if (typeof value === 'object' && value) {
    boxedValue = value;
  } else {
    throw new Error(`Demo: Can't box value of type ${typeof value}.`);
  }

  boxedValue.$$variable = name;
  return boxedValue;
}

/** Utility function to render a function when stringifying. */
export function namedFunction<T extends (...args: any[]) => any>(name: string | null, fn: T, sourceCode?: string): T {
  return Object.defineProperties(fn as TaggedFunction<T>, {
    $$functionName: {
      configurable: true,
      value: name
    },
    $$functionSource: {
      configurable: true,
      value: sourceCode
    }
  });
}
