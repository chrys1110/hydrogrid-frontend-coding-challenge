import {
  Children as ReactChildrenUtils,
  ComponentPropsWithoutRef,
  ComponentType,
  ElementType,
  Fragment,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
  useCallback,
  useMemo,
  useState
} from 'react';
import { Connection } from './Connection';
import { Downstream } from './Downstream';
import { Gate } from './Gate';
import { useIsChartInteractive } from './InteractiveContext';
import { createPlotter, ProvidePlotter } from './Plotter';
import { Reservoir } from './Reservoir';
import { Turbine } from './Turbine';
import styles from './TopologyGraph.module.css';

export interface TopologyGraphProps {
  /**
   * The child nodes are expected to be chart components, e.g.:
   *
   * {@link Reservoir} / {@link Gate} / {@link Turbine} / {@link Downstream} / {@link Connection}
   */
  children: ReactNode;

  /** @default 1 */
  scale?: number;

  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function TopologyGraph({ children, scale: targetScale = 1.0, minWidth, minHeight, maxWidth, maxHeight }: TopologyGraphProps) {
  const isInteractive = useIsChartInteractive();
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  let valuesX: number[] = [];
  let valuesY: number[] = [];

  ReactChildrenUtils.forEach(children, child => {
    if (isChartComponent(child)) {
      const p = child.props;
      if ('x' in p) {
        valuesX.push(p.x);
        valuesY.push(p.y);
      } else if ('fromX' in p) {
        valuesX.push(p.fromX, p.toX);
        valuesY.push(p.fromY, p.toY);
      }
    }
  });

  valuesX = valuesX.filter(x => Number.isFinite(x) && !isNaN(x));
  valuesY = valuesY.filter(y => Number.isFinite(y) && !isNaN(y));

  const minX = valuesX.length ? Math.min(...valuesX) : 0;
  const maxX = valuesX.length ? Math.max(...valuesX) : 0;
  const minY = valuesY.length ? Math.min(...valuesY) : 0;
  const maxY = valuesY.length ? Math.max(...valuesY) : 0;

  const { width, height, leftPadding, topPadding, scale, plotter } = useMemo(() => {
    const pixelSizePlotter = createPlotter({ minX, minY, maxX, maxY, scale: 1 });
    let { width, height } = pixelSizePlotter.calculateSize();
    const scale = Math.min(targetScale, (maxWidth ?? 1000000) / width, (maxHeight ?? 1000000) / height);

    width = Math.ceil(Math.max(minWidth ?? 0, width * scale));
    height = Math.ceil(Math.max(minHeight ?? 0, height * scale));

    const scaledPlotter = createPlotter({ minX, minY, maxX, maxY, scale });
    const scaled = scaledPlotter.calculateSize();

    return {
      width,
      height,
      scale,
      leftPadding: (width - scaled.width) / 2,
      topPadding: (height - scaled.height) / 2,
      plotter: pixelSizePlotter
    };
  }, [minX, maxX, minY, maxY, minWidth, maxWidth, minHeight, maxHeight, targetScale]);

  const trackPointer = useCallback(
    (ev: ReactMouseEvent<SVGSVGElement>) => {
      if (ev.type === 'pointerleave') {
        return setPointer(null);
      }

      const boundingBox = ev.currentTarget.getBoundingClientRect();

      const canvasX = (ev.clientX - boundingBox.left - leftPadding) / scale;
      const canvasY = (ev.clientY - boundingBox.top - topPadding) / scale;

      const { x, y } = plotter.inverse(canvasX, canvasY, true);

      setPointer(pointer => (pointer?.x === x && pointer?.y === y ? pointer : { x, y }));
    },
    [leftPadding, scale, topPadding, plotter]
  );

  const interactiveHelpers = useMemo(() => {
    if (!pointer || !isInteractive) return null;
    let { x, y } = plotter.plot(pointer.x, pointer.y);

    const color = '#ffc107';
    const positionText = `x=${pointer.x}, y=${pointer.y}`;
    const characterWidth = 8.8;
    const textPadding = 12;
    const textBoxWidth = positionText.length * characterWidth + textPadding;

    x = x * scale + 0.5;
    y = y * scale + 0.5;

    return (
      <g>
        <g>
          <rect fill="#fff" fillOpacity={0.5} x={10} y={height - 30} width={textBoxWidth} height={20} rx={4} ry={4} />
          <rect fill="#000" fillOpacity={0.5} x={10} y={height - 30} width={textBoxWidth} height={20} rx={4} ry={4} />
          <rect fill="#888" fillOpacity={0.2} x={10} y={height - 30} width={textBoxWidth} height={20} rx={4} ry={4} />
        </g>
        <text fill={color} dominantBaseline="text-top" x={16} y={height - 16}>
          {positionText}
        </text>
        <g stroke="#323232" strokeWidth={3} strokeOpacity={0.5} strokeLinecap="round">
          <line x1={x - 4} y1={y} x2={x + 4} y2={y} />
          <line x1={x} y1={y - 4} x2={x} y2={y + 4} />
        </g>
        <g stroke={color} strokeWidth={1}>
          <line x1={0} y1={y} x2={8} y2={y} />
          <line x1={width - 8} y1={y} x2={width} y2={y} />
          <line x1={x} y1={0} x2={x} y2={8} />
          <line x1={x} y1={height} x2={x} y2={height - 8} />
          <line x1={x - 4} y1={y} x2={x + 4} y2={y} />
          <line x1={x} y1={y - 4} x2={x} y2={y + 4} />
        </g>
      </g>
    );
  }, [width, height, isInteractive, plotter, pointer, scale]);

  const connections: RenderedComponent<typeof Connection>[] = [];
  const otherChildren: ReactNode[] = [];

  for (const child of flattenReactChildren(children)) {
    if (isConnection(child)) {
      connections.push(child);
    } else {
      otherChildren.push(child);
    }
  }

  // Hash to help with rerendering after hot reloading
  const graphHash = ReactChildrenUtils.toArray(children)
    .filter(isChartComponent)
    .map(({ type, props }) => {
      return 'x' in props ? `${type}(${props.x},${props.y})` : `${type}(${props.fromX},${props.fromY})-->(${props.toX},${props.toY})`;
    })
    .join(',');

  return (
    <svg
      key={graphHash}
      className={styles.graphCanvas}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      onPointerMove={isInteractive ? trackPointer : undefined}
      onPointerLeave={isInteractive ? trackPointer : undefined}
    >
      <defs>
        <marker
          id="TopologyChart-Connection-ArrowHead"
          markerUnits="strokeWidth"
          markerWidth={10}
          markerHeight={7}
          fill="#087e95"
          refX={0}
          refY={3.5}
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" />
        </marker>
      </defs>
      <rect x={0} y={0} width={width} height={height} fill="#888" fillOpacity={0.1} rx={8} ry={8} />
      <g transform={`translate(${leftPadding} ${topPadding}) scale(${scale})`}>
        <ProvidePlotter plotter={plotter}>
          <g stroke="#087e95">{connections}</g>
          {otherChildren}
        </ProvidePlotter>
      </g>
      {interactiveHelpers}
    </svg>
  );
}

TopologyGraph.displayName = 'TopologyGraph';

type RenderedComponent<T extends ElementType> = ReactElement<ComponentPropsWithoutRef<T>, T>;

type RenderedChartNode =
  | RenderedComponent<typeof Reservoir>
  | RenderedComponent<typeof Gate>
  | RenderedComponent<typeof Turbine>
  | RenderedComponent<typeof Downstream>
  | RenderedComponent<typeof Connection>;

const chartComponents = [Reservoir, Gate, Turbine, Downstream, Connection];

function isChartComponent(value: any): value is RenderedChartNode {
  if (!value || typeof value !== 'object' || typeof value.type !== 'function' || !value.props) {
    return false;
  }

  // String comparison to support hot reloading
  return (
    chartComponents.includes(value.type) ||
    chartComponents.some(comp => value.type.toString() === comp.toString()) ||
    chartComponents.some(comp => value.type.displayName === (comp as any).displayName)
  );
}

function isConnection(value: any): value is RenderedComponent<typeof Connection> {
  return isRenderedNode(value, Connection);
}

function isRenderedNode<T extends ComponentType<any>>(value: any, componentType: T): value is RenderedComponent<T> {
  if (!value || typeof value !== 'object' || typeof value.type !== 'function') {
    return false;
  }

  // String comparison to support hot reloading
  return value.type === componentType || value.type.displayName === componentType.displayName;
}

const fragmentType = (<Fragment />).type;

type PropsWithType<T extends ElementType> = ComponentPropsWithoutRef<T> & {
  type: 'reservoir' | 'gate' | 'turbine' | 'downstream' | 'connection';
};

/** Do the reverse of task 2 */
export function parseRenderedGraph(node: RenderedComponent<typeof TopologyGraph>) {
  const reservoirs: PropsWithType<typeof Reservoir>[] = [];
  const gates: PropsWithType<typeof Gate>[] = [];
  const turbines: PropsWithType<typeof Turbine>[] = [];
  const downstreams: PropsWithType<typeof Downstream>[] = [];
  const connections: PropsWithType<typeof Connection>[] = [];
  const otherChildren: ReactNode[] = [];

  // Flatten React fragments
  const children = flattenReactChildren(node.props.children);

  for (const child of children) {
    if (isRenderedNode(child, Reservoir)) {
      reservoirs.push({ ...child.props, type: 'reservoir' });
    } else if (isRenderedNode(child, Gate)) {
      gates.push({ ...child.props, type: 'gate' });
    } else if (isRenderedNode(child, Turbine)) {
      turbines.push({ ...child.props, type: 'turbine' });
    } else if (isRenderedNode(child, Downstream)) {
      downstreams.push({ ...child.props, type: 'downstream' });
    } else if (isRenderedNode(child, Connection)) {
      connections.push({ ...child.props, type: 'connection' });
    } else if (child != null && child !== false) {
      otherChildren.push(child);
    }
  }

  return {
    components: [...reservoirs, ...gates, ...turbines, ...downstreams],
    reservoirs,
    gates,
    turbines,
    downstreams,
    connections,
    otherChildren
  };
}

function flattenReactChildren(children: ReactNode | ReactNode[]): ReactNode[] {
  if (Array.isArray(children)) {
    return children.flatMap(flattenReactChildren);
  } else if (typeof children === 'object' && children && 'type' in children && children.type === fragmentType) {
    return flattenReactChildren(children.props.children);
  } else {
    return [children];
  }
}
