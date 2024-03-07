import {
  Connection,
  Downstream,
  Gate,
  Reservoir,
  TopologyGraph,
  Turbine,
} from "../scaffold";
import {
  ComponentList,
  HydroComponent,
  isControlUnit,
} from "./CodingChallengeTypes";
import { neverReached } from "./Task2/utils";

type TransformedComponent = {
  feedsFromList: Array<string>;
  spillsToList: Array<string>;
} & HydroComponent;

type TransformedComponentWithCoordinates = {
  x: number;
  y: number;
} & TransformedComponent;

function getComponentByType({
  type,
  x,
  y,
}: TransformedComponentWithCoordinates) {
  switch (type) {
    case "downstream":
      return <Downstream x={x} y={y} />;
    case "reservoir":
      return <Reservoir x={x} y={y} />;
    case "gate":
      return <Gate x={x} y={y} />;
    case "turbine":
      return <Turbine x={x} y={y} />;
  }
  neverReached(type); // Check if possible type value was not handled in switch
}

function getConnectors(list: TransformedComponentWithCoordinates[]) {
  const connectors: Array<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }> = [];
  list.forEach((component) => {
    if (!isControlUnit(component)) return;

    if (component.feedsFrom) {
      const feedsFrom = list.find((comp) => comp.id === component.feedsFrom);
      if (feedsFrom) {
        connectors.push({
          fromX: feedsFrom.x,
          fromY: feedsFrom.y,
          toX: component.x,
          toY: component.y,
        });
      }
    }

    if (component.spillsTo) {
      const spillsTo = list.find((comp) => comp.id === component.spillsTo);
      if (spillsTo) {
        connectors.push({
          fromX: component.x,
          fromY: component.y,
          toX: spillsTo.x,
          toY: spillsTo.y,
        });
      }
    }
  });
  return connectors.map((coordinates) => <Connection {...coordinates} />);
}

function withParentAndChildArrays(list: ComponentList) {
  const populatedNodes: Array<TransformedComponent> = [];

  list.forEach((component) => {
    const spillsToList = list
      .filter((comp) => isControlUnit(comp) && comp.feedsFrom === component.id)
      .map(({ id }) => id);
    if (
      isControlUnit(component) &&
      component.spillsTo &&
      !spillsToList.includes(component.spillsTo)
    )
      spillsToList.push(component.spillsTo);

    const feedsFromList = list
      .filter((comp) => isControlUnit(comp) && comp.spillsTo === component.id)
      .map(({ id }) => id);
    if (
      isControlUnit(component) &&
      component.feedsFrom &&
      !feedsFromList.includes(component.feedsFrom)
    )
      feedsFromList.push(component.feedsFrom);

    populatedNodes.push({
      ...component,
      spillsToList,
      feedsFromList,
    });
  });
  return populatedNodes;
}

function nextX(list: TransformedComponentWithCoordinates[]) {
  let max = -1;
  list.forEach(({ x }) => (max = Math.max(max, x)));
  return max + 1;
}

function nextY(list: TransformedComponentWithCoordinates[]) {
  let max = -1;
  list.forEach(({ y }) => (max = Math.max(max, y)));
  return max + 1;
}

// Mutates original list, I would eventually refactor it to be immutable
function addCoordinates(
  component: TransformedComponent,
  x: number,
  y: number,
  populatedList: TransformedComponentWithCoordinates[],
  componentList: TransformedComponent[]
) {
  if (populatedList.find(({ id }) => id === component.id)) return;
  populatedList.push({ ...component, x, y });

  const children = component.spillsToList;
  children.forEach((childId, idx) => {
    const child = componentList.find(({ id }) => id === childId);
    if (!child) return;
    let newX = 0;
    if (x > 0) {
      // If multiple roots, ignore symmetry
      newX = x + idx;
    } else if (children.length % 2 === 0) {
      // With even number of children, placement should be bottom-left and bottom-right of parent
      const halfway = children.length / 2;
      const offset = idx - halfway + (idx >= halfway ? 1 : 0);
      newX = x + offset;
    } else {
      // With odd number of children, placement should be so middle one is underneath parent
      const midpoint = Math.floor(children.length / 2);
      newX = x + idx - midpoint;
    }

    addCoordinates(child, newX, y + 1, populatedList, componentList);
  });
}

export default function ComponentListAsTopologyGraph(list: ComponentList) {
  // Add arrays to all components, so all direct parents and children are included within the component
  const populatedList = withParentAndChildArrays(list);

  // Add coordinates
  const sortedList: TransformedComponentWithCoordinates[] = [];
  const roots = populatedList.filter(
    (component) => !component.feedsFromList.length
  );
  roots.forEach((component) => {
    addCoordinates(component, nextX(sortedList), 0, sortedList, populatedList);
  });

  // Push all Downstreams to bottom
  const y = nextY(sortedList.filter(({ type }) => type !== "downstream"));
  sortedList.forEach((component) => {
    if (component.type === "downstream") {
      component.y = y + 1;
    }
  });

  return (
    <TopologyGraph>
      {sortedList.map((component) => getComponentByType(component))}
      {getConnectors(sortedList)}
    </TopologyGraph>
  );
}

// How to use the pre-built chart components (you should have autocomplete with TypeScript):
//
//   <TopologyGraph> ... Reservoirs/Gates/Turbines/Downstream/Connections ... </TopologyGraph>
//
//   <Reservoir x={0} y={0} />
//   <Gate x={0} y={1} />
//   <Turbine x={1} y={1} />
//   <Downstream x={0} y={1} />
//
//   <Connection fromX={0} fromY={0} toX={1} toY={1} />
//

// =========================

export const description = `
  Task 3:

  Write a function that takes an array of components in the same format of the first task, arranges
  them to a component topology and draw the input as a network graph (directed acyclic graph).

  Important:
  Your output does NOT have to EXACTLY look like the reference renders!


  Rules (you can look at the test cases for clarity):

  1. All "root" reservoirs that no components flows into are displayed on top (y=0).
  2. If component A flows into component B, then A is drawn above B
  3. If component A flows into components B, C, and D, then B, C and D are drawn in the same row
  4. No nodes are drawn on top of each other / at the same position
  5. Every connection in the input (feedsFrom/spillsTo) draws a <Connection>
  6. Every <Connection> must connect the correct two nodes
  7. The downstream should always be on the lowest row
  8. Whenever possible, connections should not cross each other (see examples TODO, TODO and TODO)
  9. If a chart is invalid (task 1), it is irrelevant where you place incorrect nodes

  If you can not complete all the steps above, just implement the ones you feel confident doing.
  They are sorted by difficulty, so rule 1 is least and rule 8 is most complicated to implement.

  Drawing the chart

  Components that take care of coordinates and scaling are prepared for you:
      TopologyGraph - Creates an auto-sizing drawing area
      Reservoir/Gate/Turbine/Downstream - Draws the corresponding component icon (props = x, y)
      Connection - Draws an arrow that connects two nodes (props = fromX, fromY, toX, toY)

  All coordinates of the above components can be in integers (so x = 1, 2, ...)
  and are scaled by the components inside the TopologyGraph component.

  If you hover your mouse cursor over your rendered component, helpers will appear that
  may help you to determine the correct coordinates.
`;
