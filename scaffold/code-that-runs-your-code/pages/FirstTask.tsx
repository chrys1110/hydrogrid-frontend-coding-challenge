import task1, { description } from '../../../src/Task1';
import { TaskPage, TestCase } from '../components/TaskPage/TaskPage';
import { Connection } from '../components/TopologyGraph/Connection';
import { Downstream } from '../components/TopologyGraph/Downstream';
import { Gate } from '../components/TopologyGraph/Gate';
import { Reservoir } from '../components/TopologyGraph/Reservoir';
import { TopologyGraph } from '../components/TopologyGraph/TopologyGraph';
import { Turbine } from '../components/TopologyGraph/Turbine';
import styles from './FirstTask.module.css';

export function FirstTask() {
  return (
    <TaskPage description={description} systemUnderTest={task1} placeholderCode="return { valid: true };">
      <p>Given a topology made from the following components:</p>
      <div className={styles.horizontalSplit}>
        <TopologyGraph>
          <Reservoir x={0} y={0} />
          <Gate x={0} y={1} />
          <Turbine x={0} y={2} />
          <Downstream x={0} y={3} />
        </TopologyGraph>
        <ul className={styles.chartDescription}>
          <li>Reservoir - stores water</li>
          <li>Gate - can open to release water from one reservoir into another</li>
          <li>Turbine - can generate power by flowing water through it</li>
          <li>Downstream - all water pours here in the end</li>
        </ul>
        <figure>
          <TopologyGraph>
            <Reservoir x={0} y={0} />
            <Connection fromX={0} fromY={0} toX={-1} toY={1.5} />
            <Connection fromX={0} fromY={0} toX={1} toY={1.5} />
            <Gate x={-1} y={1.5} />
            <Turbine x={1} y={1.5} />
            <Connection fromX={-1} fromY={1.5} toX={0} toY={3} />
            <Connection fromX={1} fromY={1.5} toX={0} toY={3} />
            <Downstream x={0} y={3} />
          </TopologyGraph>
          <figcaption>Example topology</figcaption>
        </figure>
      </div>

      <TestCase
        description="A very simple example topology with one turbine"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Lake' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        expectedOutput={{ valid: true }}
      >
        <TopologyGraph>
          <Reservoir x={0} y={0} />
          <Connection fromX={0} fromY={0} toX={0} toY={1} />
          <Turbine x={0} y={1} />
          <Connection fromX={0} fromY={1} toX={0} toY={2} />
          <Downstream x={0} y={2} />
        </TopologyGraph>
      </TestCase>

      <TestCase
        description="An example with two turbines"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Rain collector basin' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine 1', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'turbine', id: 'TUR-2', name: 'Turbine 2', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        expectedOutput={{ valid: true }}
      >
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
      </TestCase>

      <TestCase
        description="An example with two reservoirs"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Glacier thaw water reservoir' },
          { type: 'gate', id: 'GATE-1', name: 'Overspill gate', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine 1', feedsFrom: 'RES-1', spillsTo: 'RES-2' },
          { type: 'reservoir', id: 'RES-2', name: 'Generation reservoir' },
          { type: 'turbine', id: 'TUR-2', name: 'Turbine 2', feedsFrom: 'RES-2', spillsTo: 'DOWNSTREAM' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        expectedOutput={{ valid: true }}
      >
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
      </TestCase>

      <TestCase
        description="An invalid topology without a downstream (no-downstream)"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Lake' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine', feedsFrom: 'RES-1', spillsTo: 'RES-2' },
          { type: 'reservoir', id: 'RES-2', name: 'River (this should be a downstream)' }
        ]}
        expectedOutput={{ valid: false, reason: 'no-downstream' }}
      >
        <TopologyGraph>
          <Reservoir x={0} y={0} />
          <Connection fromX={0} fromY={0} toX={0} toY={1} />
          <Turbine x={0} y={1} />
          <Connection fromX={0} fromY={1} toX={0} toY={2} />
          <Reservoir x={0} y={2} />
        </TopologyGraph>
      </TestCase>

      <TestCase
        description="An invalid topology where units feed from a downstream (feeding-from-downstream)"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Lake' },
          { type: 'turbine', id: 'TUR-1', name: 'Top turbine', feedsFrom: 'RES-1', spillsTo: 'RES-2' },
          { type: 'downstream', id: 'DS-1', name: 'Downstream (which is incorrectly spilling to control units)' },
          { type: 'turbine', id: 'TUR-2', name: 'Turbine below the first downstream', feedsFrom: 'DS-1', spillsTo: 'DS-2' },
          { type: 'gate', id: 'GATE-1', name: 'Gate below the first downstream', feedsFrom: 'DS-1', spillsTo: 'DS-2' },
          { type: 'downstream', id: 'DS-2', name: 'Downstream at the bottom of the cascade' }
        ]}
        expectedOutput={{ valid: false, reason: 'feeding-from-downstream' }}
      >
        <TopologyGraph>
          <Reservoir x={0} y={0} />
          <Connection fromX={0} fromY={0} toX={0} toY={1} />
          <Turbine x={0} y={1} />
          <Connection fromX={0} fromY={1} toX={0} toY={2} />
          <Downstream x={0} y={2} />
          <Connection fromX={0} fromY={2} toX={-1} toY={3} />
          <Connection fromX={0} fromY={2} toX={1} toY={3} />
          <Turbine x={-1} y={3} />
          <Gate x={1} y={3} />
          <Connection fromX={-1} fromY={3} toX={0} toY={4} />
          <Connection fromX={1} fromY={3} toX={0} toY={4} />
          <Downstream x={0} y={4} />
        </TopologyGraph>
      </TestCase>

      <TestCase
        description="An invalid topology where a reservoir is not connected (reservoir-not-connected)"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Reservoir 1' },
          { type: 'reservoir', id: 'RES-2', name: 'Reservoir 2 (not connected)' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine 1', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'Downstream' }
        ]}
        expectedOutput={{ valid: false, reason: 'reservoir-not-connected' }}
      >
        <TopologyGraph>
          <Reservoir x={0} y={0} />
          <Reservoir x={1} y={0} />
          <Connection fromX={0} fromY={0} toX={0} toY={1} />
          <Turbine x={0} y={1} />
          <Connection fromX={0} fromY={1} toX={0} toY={2} />
          <Downstream x={0} y={2} />
        </TopologyGraph>
      </TestCase>

      <TestCase
        description="An invalid topology where a turbine has no input (unit-not-connected)"
        input={[
          { type: 'downstream', id: 'DOWNSTREAM', name: 'Downstream' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine 1', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'turbine', id: 'TUR-2', name: 'Turbine 2', feedsFrom: null, spillsTo: 'DOWNSTREAM' },
          { type: 'reservoir', id: 'RES-1', name: 'Reservoir 1' }
        ]}
        expectedOutput={{ valid: false, reason: 'unit-not-connected' }}
      >
        <TopologyGraph>
          <Reservoir x={0} y={0} />
          <Connection fromX={0} fromY={0} toX={0} toY={1} />
          <Turbine x={0} y={1} />
          <Turbine x={1} y={1} />
          <Connection fromX={0} fromY={1} toX={0} toY={2} />
          <Connection fromX={1} fromY={1} toX={0} toY={2} />
          <Downstream x={0} y={2} />
        </TopologyGraph>
      </TestCase>

      <TestCase
        description="An invalid topology where a gate has no output (unit-not-connected)"
        input={[
          { type: 'downstream', id: 'DOWNSTREAM', name: 'Downstream' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine 1', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'gate', id: 'GATE-1', name: 'Gate (not connected)', feedsFrom: 'RES-1', spillsTo: null },
          { type: 'reservoir', id: 'RES-1', name: 'Reservoir 1' }
        ]}
        expectedOutput={{ valid: false, reason: 'unit-not-connected' }}
      >
        <TopologyGraph>
          <Reservoir x={0} y={0} />
          <Connection fromX={0} fromY={0} toX={0} toY={1} />
          <Connection fromX={0} fromY={0} toX={1} toY={1} />
          <Turbine x={0} y={1} />
          <Gate x={1} y={1} />
          <Connection fromX={0} fromY={1} toX={0} toY={2} />
          <Downstream x={0} y={2} />
        </TopologyGraph>
      </TestCase>

      <TestCase
        description="A topology with invalid IDs (invalid-id)"
        input={[
          { type: 'downstream', id: 'DOWNSTREAM', name: 'Downstream' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine 1', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          {
            type: 'turbine',
            id: 'TUR-2',
            name: 'Turbine 2',
            feedsFrom: 'RESERVOIR-WHICH-DOES-NOT-EXIST',
            spillsTo: 'DOWNSTREAM-WHICH-DOES-NOT-EXIST'
          },
          { type: 'reservoir', id: 'RES-1', name: 'Reservoir 1' }
        ]}
        expectedOutput={{ valid: false, reason: 'invalid-id' }}
      >
        <TopologyGraph>
          <Reservoir x={0} y={0} />
          <Connection fromX={0} fromY={0} toX={0} toY={1} />
          <Turbine x={0} y={1} />
          <Turbine x={1} y={1} />
          <Connection fromX={0} fromY={1} toX={0} toY={2} />
          <Downstream x={0} y={2} />
        </TopologyGraph>
      </TestCase>

      <TestCase
        description="An invalid topology where a turbine connects to a gate (unit-connected-to-unit)"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Lake' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine', feedsFrom: 'RES-1', spillsTo: 'GATE-1' },
          { type: 'gate', id: 'GATE-1', name: 'Gate', feedsFrom: 'TUR-1', spillsTo: 'DOWNSTREAM' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        expectedOutput={{ valid: false, reason: 'unit-connected-to-unit' }}
      >
        <TopologyGraph>
          <Reservoir x={0} y={0} />
          <Connection fromX={0} fromY={0} toX={0} toY={1} />
          <Turbine x={0} y={1} />
          <Connection fromX={0} fromY={1} toX={0} toY={2} />
          <Gate x={0} y={2} />
          <Connection fromX={0} fromY={2} toX={0} toY={3} />
          <Downstream x={0} y={3} />
        </TopologyGraph>
      </TestCase>

      <TestCase
        description="An invalid topology where a turbine connects to a turbine (unit-connected-to-unit)"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Lake' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine 1', feedsFrom: 'RES-1', spillsTo: 'TUR-2' },
          { type: 'turbine', id: 'TUR-2', name: 'Turbine 2', feedsFrom: 'TUR-1', spillsTo: 'DOWNSTREAM' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        expectedOutput={{ valid: false, reason: 'unit-connected-to-unit' }}
      >
        <TopologyGraph>
          <Reservoir x={0} y={0} />
          <Connection fromX={0} fromY={0} toX={0} toY={1} />
          <Turbine x={0} y={1} />
          <Connection fromX={0} fromY={1} toX={0} toY={2} />
          <Turbine x={0} y={2} />
          <Connection fromX={0} fromY={2} toX={0} toY={3} />
          <Downstream x={0} y={3} />
        </TopologyGraph>
      </TestCase>

      <TestCase
        description="A short topology that loops into itself (closed-loop)"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Lake' },
          { type: 'gate', id: 'GATE-1', name: 'Gate 1', feedsFrom: 'RES-1', spillsTo: 'RES-2' },
          { type: 'reservoir', id: 'RES-2', name: 'Reservoir' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine 1', feedsFrom: 'RES-2', spillsTo: 'RES-1' },
          { type: 'turbine', id: 'TUR-2', name: 'Turbine 2', feedsFrom: 'RES-2', spillsTo: 'DOWNSTREAM' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        expectedOutput={{ valid: false, reason: 'closed-loop' }}
      >
        <TopologyGraph>
          <Reservoir x={0} y={0} />
          <Connection fromX={0} fromY={0} toX={0} toY={1} />
          <Gate x={0} y={1} />
          <Connection fromX={0} fromY={1} toX={0} toY={2} />
          <Reservoir x={0} y={2} />
          <Connection fromX={0} fromY={2} toX={0} toY={3} />
          <Turbine x={0} y={3} />
          <Connection fromX={0} fromY={2} toX={1} toY={1} />
          <Turbine x={1} y={1} />
          <Connection fromX={1} fromY={1} toX={0} toY={0} />
          <Connection fromX={0} fromY={3} toX={0} toY={4} />
          <Downstream x={0} y={4} />
        </TopologyGraph>
      </TestCase>

      <TestCase
        description="A long topology with no loops"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Glacier thaw water reservoir' },
          { type: 'gate', id: 'GATE-1', name: 'Overspill gate', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine 1', feedsFrom: 'RES-1', spillsTo: 'RES-2' },
          { type: 'reservoir', id: 'RES-2', name: 'Generation reservoir' },
          { type: 'turbine', id: 'TUR-2', name: 'Turbine 2', feedsFrom: 'RES-2', spillsTo: 'RES-3' },
          { type: 'reservoir', id: 'RES-3', name: 'Why not lol' },
          { type: 'turbine', id: 'TUR-3', name: 'Turbine 3', feedsFrom: 'RES-3', spillsTo: 'DOWNSTREAM' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        expectedOutput={{ valid: true }}
      >
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
          <Connection fromX={-1} fromY={2} toX={0} toY={6} />
          <Connection fromX={1} fromY={3} toX={1} toY={4} />
          <Reservoir x={1} y={4} />
          <Connection fromX={1} fromY={4} toX={1} toY={5} />
          <Turbine x={1} y={5} />
          <Connection fromX={1} fromY={5} toX={0} toY={6} />
          <Downstream x={0} y={6} />
        </TopologyGraph>
      </TestCase>

      <TestCase
        description="A long topology that loops into its top reservoir (closed-loop)"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Glacier thaw water reservoir' },
          { type: 'gate', id: 'GATE-1', name: 'Overspill gate', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine 1', feedsFrom: 'RES-1', spillsTo: 'RES-2' },
          { type: 'reservoir', id: 'RES-2', name: 'Generation reservoir' },
          { type: 'turbine', id: 'TUR-2', name: 'Turbine 2', feedsFrom: 'RES-2', spillsTo: 'RES-3' },
          { type: 'reservoir', id: 'RES-3', name: 'Why not lol' },
          { type: 'turbine', id: 'TUR-3', name: 'Turbine 3', feedsFrom: 'RES-3', spillsTo: 'RES-1' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        expectedOutput={{ valid: false, reason: 'closed-loop' }}
      >
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
          <Connection fromX={-1} fromY={2} toX={-1} toY={6} />
          <Connection fromX={1} fromY={3} toX={1} toY={4} />
          <Reservoir x={1} y={4} />
          <Connection fromX={1} fromY={4} toX={0} toY={5} />
          <Turbine x={0} y={5} />
          <Connection fromX={0} fromY={5} toX={0} toY={0} />
          <Downstream x={-1} y={6} />
        </TopologyGraph>
      </TestCase>

      <TestCase
        description="A long topology that loops into its middle reservoir (closed-loop)"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Glacier thaw water reservoir' },
          { type: 'gate', id: 'GATE-1', name: 'Overspill gate', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'turbine', id: 'TUR-1', name: 'Turbine 1', feedsFrom: 'RES-1', spillsTo: 'RES-2' },
          { type: 'reservoir', id: 'RES-2', name: 'Generation reservoir' },
          { type: 'turbine', id: 'TUR-2', name: 'Turbine 2', feedsFrom: 'RES-2', spillsTo: 'RES-3' },
          { type: 'reservoir', id: 'RES-3', name: 'Why not lol' },
          { type: 'turbine', id: 'TUR-3', name: 'Turbine 3', feedsFrom: 'RES-3', spillsTo: 'RES-2' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        expectedOutput={{ valid: false, reason: 'closed-loop' }}
      >
        <TopologyGraph>
          <Reservoir x={0} y={0} />
          <Connection fromX={0} fromY={0} toX={-1} toY={2} />
          <Connection fromX={0} fromY={0} toX={1} toY={1} />
          <Gate x={-1} y={2} />
          <Turbine x={1} y={1} />
          <Connection fromX={1} fromY={1} toX={1} toY={2} />
          <Reservoir x={1} y={2} />
          <Connection fromX={1} fromY={2} toX={2} toY={3} />
          <Turbine x={2} y={3} />
          <Connection fromX={-1} fromY={2} toX={-1} toY={6} />
          <Connection fromX={2} fromY={3} toX={2} toY={4} />
          <Reservoir x={2} y={4} />
          <Connection fromX={2} fromY={4} toX={0} toY={5} />
          <Turbine x={0} y={5} />
          <Connection fromX={0} fromY={5} toX={1} toY={2} />
          <Downstream x={-1} y={6} />
        </TopologyGraph>
      </TestCase>

      <TestCase
        description="A short cascade with a looping branch in the middle (closed-loop)"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Left top reservoir' },
          { type: 'reservoir', id: 'RES-2', name: 'Left middle reservoir' },
          { type: 'turbine', id: 'TUR-A', name: 'Top turbine', feedsFrom: 'RES-1', spillsTo: 'RES-2' },
          { type: 'turbine', id: 'TUR-B', name: 'Bottom turbine', feedsFrom: 'RES-2', spillsTo: 'DOWNSTREAM' },
          { type: 'turbine', id: 'TUR-C', name: 'Turbine branching to a loop', feedsFrom: 'RES-2', spillsTo: 'RES-3' },
          { type: 'reservoir', id: 'RES-3', name: 'Right side looping reservoir' },
          { type: 'gate', id: 'GATE-L', name: 'Gate looping back to left side', feedsFrom: 'RES-3', spillsTo: 'RES-2' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        expectedOutput={{ valid: false, reason: 'closed-loop' }}
      >
        <TopologyGraph>
          <Reservoir x={0} y={0} />
          <Connection fromX={0} fromY={0} toX={0} toY={1} />
          <Turbine x={0} y={1} />
          <Connection fromX={0} fromY={1} toX={0} toY={2} />
          <Reservoir x={0} y={2} />
          <Connection fromX={0} fromY={2} toX={0} toY={3} />
          <Connection fromX={0} fromY={2} toX={1} toY={2.5} />
          <Turbine x={1} y={2.5} />
          <Connection fromX={1} fromY={2.5} toX={2} toY={2} />
          <Reservoir x={2} y={2} />
          <Connection fromX={2} fromY={2} toX={1} toY={1.5} />
          <Gate x={1} y={1.5} />
          <Connection fromX={1} fromY={1.5} toX={0} toY={2} />
          <Turbine x={0} y={3} />
          <Connection fromX={0} fromY={3} toX={0} toY={4} />
          <Downstream x={0} y={4} />
        </TopologyGraph>
      </TestCase>

      <TestCase
        description={'A complex example with three reservoirs, gates & turbines, no loop'}
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
        expectedOutput={{ valid: true }}
      >
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
      </TestCase>

      <TestCase
        description="A very long cascade with no loop"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Top reservoir' },
          { type: 'reservoir', id: 'RES-2', name: 'Top-middle reservoir' },
          { type: 'reservoir', id: 'RES-3', name: 'Right top reservoir' },
          { type: 'reservoir', id: 'RES-4', name: 'Right bottom reservoir' },
          { type: 'turbine', id: 'TUR-A', name: 'Top turbine', feedsFrom: 'RES-1', spillsTo: 'RES-2' },
          { type: 'turbine', id: 'TUR-B', name: 'Right top turbine', feedsFrom: 'RES-2', spillsTo: 'RES-3' },
          { type: 'turbine', id: 'TUR-C', name: 'Right middle turbine', feedsFrom: 'RES-3', spillsTo: 'RES-4' },
          { type: 'turbine', id: 'TUR-D', name: 'Right bottom turbine', feedsFrom: 'RES-4', spillsTo: 'DOWNSTREAM' },
          { type: 'gate', id: 'GATE-E', name: 'Left overspill gate', feedsFrom: 'RES-1', spillsTo: 'DOWNSTREAM' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        expectedOutput={{ valid: true }}
      >
        <TopologyGraph>
          <Reservoir x={0} y={0} />
          <Connection fromX={0} fromY={0} toX={0} toY={1} />
          <Turbine x={0} y={1} />
          <Connection fromX={0} fromY={1} toX={0} toY={2} />
          <Reservoir x={0} y={2} />
          <Connection fromX={0} fromY={2} toX={1} toY={3} />
          <Turbine x={1} y={3} />
          <Connection fromX={1} fromY={3} toX={1} toY={4} />
          <Reservoir x={1} y={4} />
          <Connection fromX={1} fromY={4} toX={1} toY={5} />
          <Turbine x={1} y={5} />
          <Connection fromX={1} fromY={5} toX={1} toY={6} />
          <Reservoir x={1} y={6} />
          <Connection fromX={1} fromY={6} toX={1} toY={7} />
          <Turbine x={1} y={7} />
          <Connection fromX={1} fromY={7} toX={0} toY={8} />
          <Connection fromX={0} fromY={2} toX={-1} toY={3} />
          <Gate x={-1} y={3} />
          <Connection fromX={-1} fromY={3} toX={0} toY={8} />
          <Downstream x={0} y={8} />
        </TopologyGraph>
      </TestCase>

      <TestCase
        description="A very long cascade with a loop (closed-loop)"
        input={[
          { type: 'reservoir', id: 'RES-1', name: 'Top reservoir' },
          { type: 'reservoir', id: 'RES-2', name: 'Top-middle branching reservoir' },
          { type: 'reservoir', id: 'RES-3', name: 'Right side top reservoir' },
          { type: 'reservoir', id: 'RES-4', name: 'Right side middle reservoir' },
          { type: 'reservoir', id: 'RES-5', name: 'Right side bottom reservoir' },
          { type: 'reservoir', id: 'RES-6', name: 'Bottom reservoir that loops back up' },
          { type: 'turbine', id: 'TUR-A', name: 'Top turbine', feedsFrom: 'RES-1', spillsTo: 'RES-2' },
          { type: 'turbine', id: 'TUR-B', name: 'Right top turbine', feedsFrom: 'RES-2', spillsTo: 'RES-3' },
          { type: 'turbine', id: 'TUR-C', name: 'Right middle-top turbine', feedsFrom: 'RES-3', spillsTo: 'RES-4' },
          { type: 'turbine', id: 'TUR-D', name: 'Right middle-bottom turbine', feedsFrom: 'RES-4', spillsTo: 'RES-5' },
          { type: 'turbine', id: 'TUR-E', name: 'Bottom left turbine', feedsFrom: 'RES-5', spillsTo: 'RES-6' },
          { type: 'turbine', id: 'TUR-F', name: 'Bottom right turbine', feedsFrom: 'RES-5', spillsTo: 'DOWNSTREAM' },
          { type: 'gate', id: 'GATE-E', name: 'Gate that loops up', feedsFrom: 'RES-6', spillsTo: 'RES-1' },
          { type: 'downstream', id: 'DOWNSTREAM', name: 'River' }
        ]}
        expectedOutput={{ valid: false, reason: 'closed-loop' }}
      >
        <TopologyGraph>
          <Reservoir x={0} y={0} />
          <Connection fromX={0} fromY={0} toX={0} toY={1} />
          <Turbine x={0} y={1} />
          <Connection fromX={0} fromY={1} toX={0} toY={2} />
          <Reservoir x={0} y={2} />
          <Connection fromX={0} fromY={2} toX={1} toY={3} />
          <Turbine x={1} y={3} />
          <Connection fromX={1} fromY={3} toX={1} toY={4} />
          <Reservoir x={1} y={4} />
          <Connection fromX={1} fromY={4} toX={1} toY={5} />
          <Turbine x={1} y={5} />
          <Connection fromX={1} fromY={5} toX={1} toY={6} />
          <Reservoir x={1} y={6} />
          <Connection fromX={1} fromY={6} toX={1} toY={7} />
          <Turbine x={1} y={7} />
          <Connection fromX={1} fromY={7} toX={1} toY={8} />
          <Reservoir x={1} y={8} />
          <Connection fromX={1} fromY={8} toX={1.5} toY={9} />
          <Connection fromX={1} fromY={8} toX={0.5} toY={9} />
          <Turbine x={0.5} y={9} />
          <Connection fromX={-1} fromY={3} toX={0} toY={2} />
          <Gate x={-1} y={3} />
          <Connection fromX={0.5} fromY={9} toX={0} toY={10} />
          <Reservoir x={0} y={10} />
          <Connection fromX={0} fromY={10} toX={-1} toY={3} />
          <Turbine x={1.5} y={9} />
          <Connection fromX={1.5} fromY={9} toX={2} toY={10} />
          <Downstream x={2} y={10} />
        </TopologyGraph>
      </TestCase>

      {/* */}
    </TaskPage>
  );
}
