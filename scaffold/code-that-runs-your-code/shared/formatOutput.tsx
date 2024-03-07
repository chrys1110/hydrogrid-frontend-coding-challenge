import { Fragment, ReactNode } from 'react';
import { renderJsxElementToSource } from './renderJsxToSource';
import { isJSX } from './valueTypes';

export function formatValue(value: any) {
  if (value === undefined) {
    return 'undefined';
  }

  if (isJSX(value)) {
    // JSX can not be sent through JSON.stringify, so we use our magic stringification function.
    //
    // To allow the applicant to use JSX fragments (<></>), we remove them in the output
    // and to allow comparing two rendered components by string, we remove the key="..." attribute.
    return renderJsxElementToSource(jsxWithoutFragmentsOrKeys(value), '  ');
  }

  // We try to not have newlines in JSON.strinigfy output
  const withNewlines = JSON.stringify(value, null, 2);
  return withNewlines.replace(/\n\s*/g, ' ');
}

const fragmentType = (<Fragment />).type;

/** Replace <Fragment>s in rendered JSX with the fragments children, remove keys */
export function jsxWithoutFragmentsOrKeys(input: ReactNode): ReactNode {
  if (Array.isArray(input)) {
    return input.flatMap(jsxWithoutFragmentsOrKeys);
  }

  if (typeof input !== 'object' || !input || !('type' in input)) {
    return input;
  }

  if (input.type === fragmentType) {
    return jsxWithoutFragmentsOrKeys(input.props.children);
  }

  if (Array.isArray(input.props.children)) {
    return {
      ...input,
      key: null,
      props: {
        ...input.props,
        children: input.props.children.flatMap(jsxWithoutFragmentsOrKeys)
      }
    };
  }

  return { ...input, key: null };
}

export function formatWithColor(text: string, className: string) {
  return text.split('\n').map((line, index) => (
    <Fragment key={index}>
      {index > 0 && `\n// `}
      <span className={className}>{line}</span>
    </Fragment>
  ));
}

export function formatError(error: any) {
  if (!(error instanceof Error)) {
    return formatValue(error);
  } else if (error.stack) {
    return error.stack
      .replace(/^([\S\s]+?\n {4}at [Tt]ask\d\S* \([^\n]+\))[\s\S]*/, '$1')
      .replaceAll(/(\n {4}at (?:[^(]+) \().+?\/(src\/[^)?]+)(?:\?[^):]+)?(:\d+(:\d+)?)?(\))(?=\n|$)/g, '$1$2$3)');
  } else {
    return error.message;
  }
}
