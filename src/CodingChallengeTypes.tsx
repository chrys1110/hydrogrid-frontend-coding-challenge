// Type definitions for your expected input/output.
// You should not have to change anything in this file, but you can.

export interface Hydrobody {
  type: 'reservoir' | 'downstream';
  id: string;
  name: string;
}

export interface ControlUnit {
  type: 'turbine' | 'gate';
  id: string;
  name: string;
  feedsFrom: string | null;
  spillsTo: string | null;
}

export type HydroComponent = Hydrobody | ControlUnit;

export type ComponentList = HydroComponent[];

export type Task1Result =
  | { valid: true }
  | {
      valid: false;
      reason:
        | 'no-downstream'
        | 'feeding-from-downstream'
        | 'unit-not-connected'
        | 'reservoir-not-connected'
        | 'invalid-id'
        | 'unit-connected-to-unit'
        | 'closed-loop';
    };

// Typed utility functions, if you need them, to help TypeScript infer the correct type,
// e.g. componentList.filter(isHydrobody)  -->  Hydrobody[]

export function isHydrobody(v: HydroComponent | null | undefined): v is Hydrobody {
  return v != null && (v.type === 'reservoir' || v.type === 'downstream');
}

export function isControlUnit(v: HydroComponent | null | undefined): v is ControlUnit {
  return v != null && (v.type === 'turbine' || v.type === 'gate');
}
