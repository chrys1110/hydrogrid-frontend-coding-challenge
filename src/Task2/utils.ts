import Downstream from "../../scaffold/code-that-runs-your-code/assets/icons/downstream.svg";
import Gate from "../../scaffold/code-that-runs-your-code/assets/icons/gate.svg";
import Reservoir from "../../scaffold/code-that-runs-your-code/assets/icons/reservoir.svg";
import Turbine from "../../scaffold/code-that-runs-your-code/assets/icons/turbine.svg";

import type { Type } from "./types";
import type { ControlUnit, Hydrobody } from "../CodingChallengeTypes";

export function getIconByType(type: Type) {
  switch (type) {
    case "reservoir":
      return Reservoir;
    case "downstream":
      return Downstream;
    case "gate":
      return Gate;
    case "turbine":
      return Turbine;
  }
  return neverReached(type); // Check if possible type value was not handled in switch
}
export function neverReached(never: never) {
  return undefined;
}

export const EMPTY_RESERVOIR: Hydrobody = {
  name: "",
  id: "",
  type: "reservoir",
};
export const SELECT_NULL = "__NULL__";

// I would usually use Zod instead
export function isValidType(type: string): type is Type {
  return (
    type === "reservoir" ||
    type === "downstream" ||
    type === "turbine" ||
    type === "gate"
  );
}

// I would usually use Zod instead
export function isControlUnitType(type?: Type): type is ControlUnit["type"] {
  return type === "gate" || type === "turbine";
}
