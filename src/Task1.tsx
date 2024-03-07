import {
  ComponentList,
  ControlUnit,
  Hydrobody,
  HydroComponent,
  isControlUnit,
  isHydrobody,
  Task1Result,
} from "./CodingChallengeTypes";

function recursivelyCheckParentsForDuplicateReservoirs(
  component: HydroComponent,
  list: ComponentList,
  previousReservoirs: string[]
): boolean {
  const nextReservoirs = [...previousReservoirs];

  if (component.type === "reservoir") {
    if (previousReservoirs.includes(component.id)) {
      return true;
    }
    nextReservoirs.push(component.id);
  }

  const parents: HydroComponent[] = [];
  if (isControlUnit(component)) {
    const parent = list.find((comp) => comp.id === component.feedsFrom);
    if (parent) {
      parents.push(parent);
    }
  }
  list
    .filter((comp) => isControlUnit(comp) && comp.spillsTo === component.id)
    .forEach((comp) => parents.push(comp));

  if (!parents) {
    return false;
  }
  return parents.some((comp) => {
    return recursivelyCheckParentsForDuplicateReservoirs(comp, list, [
      ...nextReservoirs,
    ]);
  });
}

export default function validateComponentTopology(
  list: ComponentList
): Task1Result {
  // Rule 1
  if (!list.find((component) => component.type === "downstream")) {
    return { valid: false, reason: "no-downstream" };
  }

  // Utility for later
  const allControlUnits = list.filter(isControlUnit);

  // Rule 2
  if (
    allControlUnits &&
    !allControlUnits.every((controlUnit) => {
      const feedsFrom = list.find(
        (component) => component.id === controlUnit.feedsFrom
      );
      const spillsTo = list.find(
        (component) => component.id === controlUnit.spillsTo
      );
      if (!controlUnit.feedsFrom || !controlUnit.spillsTo) {
        return false;
      }
      return true;
    })
  ) {
    return { valid: false, reason: "unit-not-connected" };
  }

  // Rule 3
  if (
    allControlUnits &&
    !allControlUnits.every((controlUnit) => {
      const feedsFrom = list.find(
        (component) => component.id === controlUnit.feedsFrom
      );
      if (feedsFrom && feedsFrom.type === "downstream") {
        return false;
      }
      return true;
    })
  ) {
    return { valid: false, reason: "feeding-from-downstream" };
  }

  // Rule 4
  function isReservoir(
    v: HydroComponent | null | undefined
  ): v is { type: "reservoir" } & Hydrobody {
    return v != null && v.type === "reservoir";
  }
  const allReservoirs = list.filter(isReservoir);
  if (
    allReservoirs &&
    !allReservoirs.every((reservoir) => {
      return allControlUnits.some(
        (controlUnit) => controlUnit.feedsFrom === reservoir.id
      );
    })
  ) {
    return { valid: false, reason: "reservoir-not-connected" };
  }

  // Rule 5
  if (
    allControlUnits &&
    allControlUnits.some(
      (controlUnit) =>
        !list.find((comp) => controlUnit.spillsTo === comp.id) ||
        !list.find((comp) => controlUnit.feedsFrom === comp.id)
    )
  ) {
    return { valid: false, reason: "invalid-id" };
  }
  // Rule 6
  if (
    allControlUnits &&
    allControlUnits.some((controlUnit) => {
      const feedsFrom = list.find(
        (component) => component.id === controlUnit.feedsFrom
      );
      const spillsTo = list.find(
        (component) => component.id === controlUnit.spillsTo
      );
      if (isControlUnit(feedsFrom) || isControlUnit(spillsTo)) {
        return true;
      }
      return false;
    })
  ) {
    return { valid: false, reason: "unit-connected-to-unit" };
  }

  // Rule 7
  if (
    list.some((component) =>
      recursivelyCheckParentsForDuplicateReservoirs(component, list, [])
    )
  ) {
    return { valid: false, reason: "closed-loop" };
  }
  return { valid: true };
}

// =========================

export const description = `
  Task 1:

  Write a function that validates if a given input is a valid component topology.
  Your function gets a list of components as an array and should either:
    - return { valid: true } - if the list adheres to all the rules below, or
    - return { valid: false, reason: "<first rule that was violated>" }


  Rules to validate against:

  Rule 1 (reason: "no-downstream")
      In every topology, there must exist at least one downstream (type="downstream").
      This is where water ends up spilling to at the end of a topology.

  Rule 2 (reason: "unit-not-connected")
      Every control unit (type="turbine" or type="gate") must take water from a component (feedsFrom)
      and spill its water into a component (spillsTo).

  Rule 3 (reason: "feeding-from-downstream")
      A control unit (type="turbine" or "gate") may spill to a downstream (spillsTo === downstream.id),
      but control units may not take water from downstream (feedsFrom === downstream.id).

  Rule 4 (reason: "reservoir-not-connected"):
      Every reservoir (type="reservoir") needs to be spill into a control unit (type="turbine" or "gate").
      Does not apply to type="downstream" hydrobodies.
      It is okay for a reservoir to spill into multiple control units, and for multiple control units
      to spill into the same reservoir.

  Rule 5 (reason: "invalid-id")
      The components a control unit connects to (feedsFrom, spillsTo) must be the id of another component.

  Rule 6 (reason: "unit-connected-to-unit")
      A turbine or gate can not connect to another turbine or a gate.

  Rule 7 (reason: "closed-loop")
      It is not allowed for a component to spill into a reservoir "above" it (e.g. A -> B -> C -> D -> A)
`;
