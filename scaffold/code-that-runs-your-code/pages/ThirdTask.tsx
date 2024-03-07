import { ComponentPropsWithoutRef, ReactElement } from 'react';
import { TaskPage, TestCase } from '../components/TaskPage/TaskPage';
import { Connection } from '../components/TopologyGraph/Connection';
import { Downstream } from '../components/TopologyGraph/Downstream';
import { Gate } from '../components/TopologyGraph/Gate';
import { Reservoir } from '../components/TopologyGraph/Reservoir';
import { parseRenderedGraph, TopologyGraph } from '../components/TopologyGraph/TopologyGraph';
import { Turbine } from '../components/TopologyGraph/Turbine';
import { reindent } from '../shared/reindent';
import { renderJsxElementToSource } from '../shared/renderJsxToSource';
import Task3, { description } from '../../../src/Task3';
import styles from './ThirdTask.module.css';
import { MakeChartInteractive } from '../components/TopologyGraph/InteractiveContext';

const placeholderCode = `
return <TopologyGraph>
  <Reservoir x={0} y={0} />
  <Connection fromX={0} fromY={0} toX={-1} toY={1} />
  <Gate x={-1} y={1} />
  <Connection fromX={0} fromY={0} toX={1} toY={1} />
  <Turbine x={1} y={1} />
  <Connection fromX={-1} fromY={1} toX={0} toY={2} />
  <Connection fromX={1} fromY={1} toX={0} toY={2} />
  <Downstream x={0} y={2} />
</TopologyGraph>;
`;

export function ThirdTask() {
  return (
    <TaskPage description={description} systemUnderTest={Task3} placeholderCode={placeholderCode}>
      <p>Given a topology like in the first task, write code that draws the components in a network graph, for example:</p>
      <div className={styles.horizontalSplit}>
        <pre>
          <code>
            {reindent`
              return (
                <TopologyGraph>
                  <Reservoir x={0} y={0} />
                  <Connection fromX={0} fromY={0} toX={-1} toY={1} />
                  <Connection fromX={0} fromY={0} toX={1} toY={1} />
                  <Turbine x={-1} y={1} />
                  <Turbine x={1} y={1} />
                  <Connection fromX={-1} fromY={1} toX={0} toY={2} />
                  <Connection fromX={1} fromY={1} toX={0} toY={2} />
                  <Downstream x={0} y={2} />
                </TopologyGraph>
              );
            `}
          </code>
        </pre>
        <figure>
          <MakeChartInteractive>
            <TopologyGraph>
              <Reservoir x={0} y={0} />
              <Connection fromX={0} fromY={0} toX={-1} toY={1} />
              <Connection fromX={0} fromY={0} toX={1} toY={1} />
              <Turbine x={-1} y={1} />
              <Turbine x={1} y={1} />
              <Connection fromX={-1} fromY={1} toX={0} toY={2} />
              <Connection fromX={1} fromY={1} toX={0} toY={2} />
              <Downstream x={0} y={2} />
            </TopologyGraph>
          </MakeChartInteractive>
          <figcaption>Example output</figcaption>
        </figure>
      </div>

      <TestCase
        description="The smallest possible topology chart"
        input={[{ type: 'downstream', id: 'DOWNSTREAM', name: 'River' }]}
        exampleOutput={
          <TopologyGraph>
            <Downstream x={0} y={0} />
          </TopologyGraph>
        }
        validate={validateChart}
      />

      <TestCase
        description="A simple example with one turbine"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Lake' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        exampleOutput={
          <TopologyGraph>
            <Reservoir x={0} y={0} />
            <Connection fromX={0} fromY={0} toX={0} toY={1} />
            <Turbine x={0} y={1} />
            <Connection fromX={0} fromY={1} toX={0} toY={2} />
            <Downstream x={0} y={2} />
          </TopologyGraph>
        }
        validate={validateChart}
      />

      <TestCase
        description="An example with two turbines"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Rain collector basin' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine 1', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'turbine', id: 'TUR-2', name: 'Turbine 2', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        exampleOutput={
          <TopologyGraph>
            <Reservoir x={0} y={0} />
            <Connection fromX={0} fromY={0} toX={-1} toY={1} />
            <Connection fromX={0} fromY={0} toX={1} toY={1} />
            <Turbine x={-1} y={1} />
            <Turbine x={1} y={1} />
            <Connection fromX={-1} fromY={1} toX={0} toY={2} />
            <Connection fromX={1} fromY={1} toX={0} toY={2} />
            <Downstream x={0} y={2} />
          </TopologyGraph>
        }
        validate={validateChart}
      />

      <TestCase
        description="An example with two top reservoirs"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Old danube' },
          { type: 'reservoir', id: 'RES-2', name: 'New danube' },
          { type: 'turbine', id: 'TUR-1', name: 'Rusty old turbine', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'turbine', id: 'TUR-2', name: 'Shiny new turbine', feedsFrom: 'RES-2', spillsTo: 'DOWNSTREAM' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        exampleOutput={
          <TopologyGraph>
            <Reservoir x={-1} y={0} />
            <Reservoir x={1} y={0} />
            <Connection fromX={-1} fromY={0} toX={-1} toY={1} />
            <Connection fromX={1} fromY={0} toX={1} toY={1} />
            <Turbine x={-1} y={1} />
            <Turbine x={1} y={1} />
            <Connection fromX={-1} fromY={1} toX={0} toY={2} />
            <Connection fromX={1} fromY={1} toX={0} toY={2} />
            <Downstream x={0} y={2} />
          </TopologyGraph>
        }
        validate={validateChart}
      />

      <TestCase
        description="An example with two reservoirs (heavy left side)"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Glacier thaw water reservoir' },
          { type: 'gate', id: 'GATE-1', name: 'Top gate', feedsFrom: 'RES-1', spillsTo: 'RES-2' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'reservoir', id: 'RES-2', name: 'Reservoir between gates' },
          { type: 'gate', id: 'GATE-2', name: 'Bottom gate', feedsFrom: 'RES-2', spillsTo: 'DOWNSTREAM' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        exampleOutput={
          <TopologyGraph>
            <Reservoir x={0} y={0} />
            <Connection fromX={0} fromY={0} toX={-1} toY={1} />
            <Connection fromX={0} fromY={0} toX={1} toY={2} />
            <Gate x={-1} y={1} />
            <Turbine x={1} y={2} />
            <Connection fromX={-1} fromY={1} toX={-1} toY={2} />
            <Reservoir x={-1} y={2} />
            <Connection fromX={1} fromY={2} toX={0} toY={4} />
            <Gate x={-1} y={3} />
            <Connection fromX={-1} fromY={2} toX={-1} toY={3} />
            <Connection fromX={-1} fromY={3} toX={0} toY={4} />
            <Downstream x={0} y={4} />
          </TopologyGraph>
        }
        validate={validateChart}
      />

      <TestCase
        description="An example with two reservoirs (heavy right side)"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Glacier thaw water reservoir' },
          { type: 'gate', id: 'GATE-1', name: 'Overspill gate', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine 1', feedsFrom: 'RES-1', spillsTo: 'RES-2' },
          { type: 'reservoir', id: 'RES-2', name: 'Generation reservoir' },
          { type: 'turbine', id: 'TUR-2', name: 'Turbine 2', feedsFrom: 'RES-2', spillsTo: 'DOWNSTREAM' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        exampleOutput={
          <TopologyGraph>
            <Reservoir x={0} y={0} />
            <Connection fromX={0} fromY={0} toX={-1} toY={2} />
            <Connection fromX={0} fromY={0} toX={1} toY={1} />
            <Gate x={-1} y={2} />
            <Turbine x={1} y={1} />
            <Connection fromX={1} fromY={1} toX={1} toY={2} />
            <Reservoir x={1} y={2} />
            <Connection fromX={1} fromY={2} toX={1} toY={3} />
            <Turbine x={1} y={3} />
            <Connection fromX={-1} fromY={2} toX={0} toY={4} />
            <Connection fromX={1} fromY={3} toX={0} toY={4} />
            <Downstream x={0} y={4} />
          </TopologyGraph>
        }
        validate={validateChart}
      />

      <TestCase
        description={'A complex example with three reservoirs, gates & turbines (hard!)'}
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Top-left reservoir' },
          { type: 'reservoir', id: 'RES-2', name: 'Top-right reservoir' },
          { type: 'reservoir', id: 'RES-3', name: 'Middle storage reservoir' },
          { type: 'turbine', id: 'TUR-1', name: 'Left main turbine', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'turbine', id: 'TUR-2', name: 'Right main turbine', feedsFrom: 'RES-2', spillsTo: 'DOWNSTREAM' },
          { type: 'gate', id: 'GATE-1', name: 'Left overspill gate', feedsFrom: 'RES-1', spillsTo: 'RES-3' },
          { type: 'gate', id: 'GATE-2', name: 'Right overspill gate', feedsFrom: 'RES-2', spillsTo: 'RES-3' },
          { type: 'turbine', id: 'TUR-3', name: 'Storage turbine', feedsFrom: 'RES-3', spillsTo: 'DOWNSTREAM' },
          { type: 'gate', id: 'GATE-3', name: 'Storage overspill gate', feedsFrom: 'RES-3', spillsTo: 'DOWNSTREAM' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        exampleOutput={
          <TopologyGraph>
            <Reservoir x={0} y={0} />
            <Connection fromX={0} fromY={0} toX={0} toY={4} />
            <Connection fromX={0} fromY={0} toX={1} toY={1} />
            <Turbine x={0} y={4} />
            <Gate x={1} y={1} />
            <Connection fromX={1} fromY={1} toX={2} toY={2} />
            <Reservoir x={2} y={2} />
            <Connection fromX={2} fromY={2} toX={1} toY={3} />
            <Turbine x={1} y={3} />
            <Connection fromX={2} fromY={2} toX={3} toY={3} />
            <Gate x={3} y={3} />
            <Connection fromX={0} fromY={4} toX={2} toY={5} />
            <Connection fromX={1} fromY={3} toX={2} toY={5} />
            <Reservoir x={4} y={0} />
            <Connection fromX={4} fromY={0} toX={3} toY={1} />
            <Gate x={3} y={1} />
            <Connection fromX={3} fromY={1} toX={2} toY={2} />
            <Gate x={3} y={1} />
            <Connection fromX={4} fromY={0} toX={4} toY={4} />
            <Turbine x={4} y={4} />
            <Connection fromX={3} fromY={3} toX={2} toY={5} />
            <Connection fromX={4} fromY={4} toX={2} toY={5} />
            <Downstream x={2} y={5} />
          </TopologyGraph>
        }
        validate={validateChart}
      />
    </TaskPage>
  );
}

type TestCaseInput = (
  | {
      type: 'reservoir' | 'downstream';
      id: string;
      name: string;
    }
  | { type: 'turbine' | 'gate'; id: string; name: string; feedsFrom: string | null; spillsTo: string | null }
)[];

/** Validates that a rendered chart adheres to all rules described in task 2 */
function validateChart(input: TestCaseInput, output: unknown) {
  const rootNode = output as ReactElement;
  if (
    typeof rootNode !== 'object' ||
    !rootNode ||
    !rootNode.props ||
    typeof rootNode.type !== 'function' ||
    (rootNode.type !== TopologyGraph && rootNode.type?.displayName === TopologyGraph.displayName)
  ) {
    return 'Your function does not return a <TopologyGraph>.';
  }

  const errors: string[] = [];

  const graphNode = rootNode as ReactElement<ComponentPropsWithoutRef<typeof TopologyGraph>, typeof TopologyGraph>;
  const { components, reservoirs, gates, turbines, downstreams, connections, otherChildren } = parseRenderedGraph(graphNode);

  const connectionsFrom = new Map<string, typeof connections>();
  const connectionsTo = new Map<string, typeof connections>();
  const seenConnections = new Set<string>();

  const pointToString = (p: { x: number; y: number }) => `(${p.x}, ${p.y})`;
  const connectionToString = (c: typeof connections[number]) => `(${c.fromX}, ${c.fromY})-->(${c.toX}, ${c.toY})`;

  for (const connection of connections) {
    // Validate that all coordinates are numbers
    for (const prop of ['fromX', 'fromY', 'toX', 'toY'] as const) {
      const value = connection[prop];
      if (isNaN(value)) {
        errors.push(`You rendered a <Connection> with ${prop}=${value}, but a number was expected`);
      }
    }

    const { fromX, fromY, toX, toY } = connection;
    const fromStr = pointToString({ x: fromX, y: fromY });
    const toStr = pointToString({ x: toX, y: toY });
    const lineStr = connectionToString(connection);

    // Warn when a connection draws from P to P
    if (fromX === toX && fromY === toY) {
      errors.push(`You are drawing a Connection to its own start point: ${connectionToString(connection)}`);
    }

    // Warn when a connection is drawn multiple times
    if (seenConnections.has(lineStr)) {
      errors.push(`You rendered multiple <Connection> components at ${lineStr}`);
    }
    seenConnections.add(lineStr);

    // Record where connections are drawn
    if (connectionsFrom.has(fromStr)) {
      connectionsFrom.get(fromStr)?.push(connection);
    } else {
      connectionsFrom.set(fromStr, [connection]);
    }

    if (connectionsTo.has(toStr)) {
      connectionsTo.get(toStr)?.push(connection);
    } else {
      connectionsTo.set(toStr, [connection]);
    }
  }

  const getConnectionsFrom = ({ x, y }: { x: number; y: number }) => connectionsFrom.get(`(${x}, ${y})`) ?? [];
  const getConnectionsTo = ({ x, y }: { x: number; y: number }) => connectionsTo.get(`(${x}, ${y})`) ?? [];

  // const allXCoordinates = [...components.map(c => c.x), ...connections.map(c => c.fromX), ...connections.map(c => c.toX)];
  const allYCoordinates = [...components.map(c => c.y), ...connections.map(c => c.fromY), ...connections.map(c => c.toY)];
  // const minX = Math.min(...allXCoordinates);
  // const maxX = Math.max(...allXCoordinates);
  const minY = Math.min(...allYCoordinates);
  const maxY = Math.max(...allYCoordinates);

  // Rule 1: Reservoirs must be on top
  const reservoirsWithoutInflow = reservoirs.filter(reservoir => getConnectionsTo(reservoir).length === 0);
  for (const { x, y } of reservoirsWithoutInflow) {
    if (y !== minY && !isNaN(minY)) {
      errors.push(`Rule 1: Reservoir with no inflows drawn at (${x}, ${y}), but something is drawn above it at y=${minY}.`);
    }
  }

  // Rule 2: If A flows into to B, A is drawn above B
  for (const { fromX, fromY, toX, toY } of connections) {
    if (toY === fromY) {
      errors.push(`Rule 2: A connection points to a component in the same row: (${fromX}, ${fromY})-->(${toX},${toY}).`);
    } else if (toY < fromY) {
      errors.push(`Rule 2: A connection points to a component above it: (${fromX}, ${fromY})-->(${toX},${toY}).`);
    }
  }

  // Rule 3: If component A flows into components B, C, and D, then B, C and D are drawn in the same row
  // Not sure how to validate "next to each other" ¯\_(ツ)_/¯
  const inputReservoirs = input.filter(component => component.type === 'reservoir');
  const inputGates = input.filter(component => component.type === 'gate');
  const inputTurbines = input.filter(component => component.type === 'turbine');
  const inputDownstreams = input.filter(component => component.type === 'downstream');

  if (reservoirs.length !== inputReservoirs.length) {
    errors.push(`Rule 3: Input contains ${inputReservoirs.length} reservoirs, you are rendering ${reservoirs.length}.`);
  }
  if (gates.length !== inputGates.length) {
    errors.push(`Rule 3: Input contains ${inputGates.length} gates, you are rendering ${gates.length}.`);
  }
  if (turbines.length !== inputTurbines.length) {
    errors.push(`Rule 3: Input contains ${inputTurbines.length} turbines, you are rendering ${turbines.length}.`);
  }
  if (downstreams.length !== inputDownstreams.length) {
    errors.push(`Rule 3: Input contains ${inputDownstreams.length} gates, you are rendering ${downstreams.length}.`);
  }

  // Rule 4: No nodes are drawn at the same position
  const componentAtCoordInOutput = new Map<string, typeof components[0]>();
  for (const component of components) {
    const coord = pointToString(component);
    const existingComponentAtCoordinate = componentAtCoordInOutput.get(coord);

    const nanProps = [isNaN(component.x) && 'x=NaN', isNaN(component.x) && 'y=NaN'].filter(Boolean);

    if (nanProps.length > 0) {
      errors.push(`You rendered a <Connection> with ${nanProps.join(', ')}, but a number was expected`);
    } else if (existingComponentAtCoordinate) {
      errors.push(`Rule 4: Mutiple components are drawn at the same coordinate ${coord}.`);
    }
    componentAtCoordInOutput.set(coord, component);
  }

  // Rule 5: If the input has n connections, the drawn graph has to have n <Connection> components
  const connectionsInInput = input.flatMap(component => {
    if (component.type !== 'gate' && component.type !== 'turbine') return [];
    const connections = [];
    if (component.feedsFrom) {
      connections.push({ from: component.feedsFrom, to: component.id });
    }
    if (component.spillsTo) {
      connections.push({ from: component.id, to: component.spillsTo });
    }
    return connections;
  });
  if (connections.length !== connectionsInInput.length) {
    errors.push(
      `Rule 5: Your output is missing connections, input list has ${connectionsInInput.length}, but your output has ${connections.length}`
    );
  }

  // Rule 6: Every Connection must connect the correct two nodes
  const componentsById = Object.fromEntries(input.map(component => [component.id, component]));
  const componentConnectionsInInput = input.map(component => {
    if (component.type === 'turbine' || component.type === 'gate') {
      return {
        ...component,
        inputs: [componentsById[component.feedsFrom ?? '-']],
        outputs: [componentsById[component.spillsTo ?? '-']]
      };
    } else {
      return {
        ...component,
        inputs: input.filter(c => 'spillsTo' in c && c.spillsTo === component.id),
        outputs: input.filter(c => 'feedsFrom' in c && c.feedsFrom === component.id)
      };
    }
  });

  // Build linked-list-style graph from rendered output (phew!)
  const componentConnectionsInOutput = components.map(component => {
    const inputs = getConnectionsTo(component).map(({ fromX: x, fromY: y }) => componentAtCoordInOutput.get(pointToString({ x, y })));
    const outputs = getConnectionsFrom(component).map(({ toX: x, toY: y }) => componentAtCoordInOutput.get(pointToString({ x, y })));

    return { ...component, inputs, outputs };
  });

  // Compare input & output component lists
  const visitedOutputComponents = new Set<typeof componentConnectionsInOutput[0]>();
  const stringifyTypes = (array: ({ type: string } | undefined)[]) =>
    array
      .map(item => (item ? item.type : 'invalid-id'))
      .sort()
      .join(',');

  for (const inputComponent of componentConnectionsInInput) {
    const outputsOfSameType = componentConnectionsInOutput.filter(
      outputComponent => inputComponent.type === outputComponent.type && !visitedOutputComponents.has(outputComponent)
    );
    const matchingOutput = outputsOfSameType.find(
      outputComponent =>
        inputComponent.inputs.length === outputComponent.inputs.length &&
        inputComponent.outputs.length === outputComponent.outputs.length &&
        stringifyTypes(inputComponent.inputs) === stringifyTypes(outputComponent.inputs) &&
        stringifyTypes(inputComponent.outputs) === stringifyTypes(outputComponent.outputs)
    );

    if (matchingOutput) {
      visitedOutputComponents.add(matchingOutput);
    } else {
      errors.push(`Rule 6: The ${inputComponent.type} with id ${inputComponent.id} does not seem to be connected correctly in the output.`);
    }
  }

  const visitedInputComponents = new Set<typeof componentConnectionsInInput[0]>();
  for (const outputComponent of componentConnectionsInOutput) {
    const inputsOfSameType = componentConnectionsInInput.filter(
      inputComponent => outputComponent.type === inputComponent.type && !visitedInputComponents.has(inputComponent)
    );
    const matchingInput = inputsOfSameType.find(
      inputComponent =>
        outputComponent.inputs.length === inputComponent.inputs.length &&
        outputComponent.outputs.length === inputComponent.outputs.length &&
        stringifyTypes(outputComponent.inputs) === stringifyTypes(inputComponent.inputs) &&
        stringifyTypes(outputComponent.outputs) === stringifyTypes(inputComponent.outputs)
    );

    if (matchingInput) {
      visitedInputComponents.add(matchingInput);
    } else {
      errors.push(`Rule 6: The ${outputComponent.type} you rendered at ${pointToString(outputComponent)} is missing connections.`);
    }
  }

  // Rule 7: The downstream should always be on the lowest row
  if (downstreams.length !== 1) {
    errors.push(`Graph contains ${downstreams.length} <Downstream> components, when only 1 was expected.`);
  }
  for (const { x, y } of downstreams) {
    if (y !== maxY && !isNaN(maxY)) {
      errors.push(`Rule 7: Downstream drawn at (${x}, ${y}), but something is drawn below it at y=${maxY}.`);
    }
  }

  // Rule 8: Connections should not cross each other (ray intersection)
  const reportedIntersections: [typeof connections[0], typeof connections[0]][] = [];
  for (const a of connections) {
    for (const b of connections) {
      // We ignore identical vectors, even though they technically intersect
      if (a === b) continue;
      if (a.fromX === b.fromX && a.fromY === b.fromY && a.toX === b.toX && a.toY === b.toY) continue;
      if (reportedIntersections.some(([prevA, prevB]) => a === prevB && b === prevA)) continue;

      // Intersect a and b
      //
      const det = (a.toX - a.fromX) * (b.toY - b.fromY) - (b.toX - b.fromX) * (a.toY - a.fromY);
      if (det === 0) {
        continue;
      }

      const lambda = ((b.toY - b.fromY) * (b.toX - a.fromX) + (b.fromX - b.toX) * (b.toY - a.fromY)) / det;
      const gamma = ((a.fromY - a.toY) * (b.toX - a.fromX) + (a.toX - a.fromX) * (b.toY - a.fromY)) / det;
      const linesIntersect = 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;

      if (linesIntersect) {
        const intersectionPoint = pointToString({
          x: Number((a.fromX + lambda * (a.toX - a.fromX)).toFixed(2)),
          y: Number((a.fromY + lambda * (a.toY - a.fromY)).toFixed(2))
        });
        errors.push(`Rule 8: Two connections intersect at ${intersectionPoint}: ${connectionToString(a)} and ${connectionToString(b)}.`);
        reportedIntersections.push([a, b]);
      }
    }
  }

  // Rule 9: If a chart is invalid (task 1), it is irrelevant where you place incorrect nodes
  // Needs no validation / validation done in other rules

  // Other sanity checks
  if (otherChildren.length > 0) {
    const src = otherChildren
      .map(child => renderJsxElementToSource(child, '  '))
      .join('\n')
      .replace(/\n/g, '\n  ');
    errors.push(`You are rendering other children inside <TopologyGraph>: ${src.includes('\n') ? '\n  ' : ''}${src}`);
  }

  if (errors.length === 0) {
    return true;
  }

  const uniqueErrors = [...new Set(errors)];
  return uniqueErrors.join('\n');
}
