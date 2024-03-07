import { ReactElement } from 'react';

export function isJSX(value: any): value is ReactElement {
  return typeof value === 'object' && value && 'type' in value && 'props' in value && 'key' in value;
}
