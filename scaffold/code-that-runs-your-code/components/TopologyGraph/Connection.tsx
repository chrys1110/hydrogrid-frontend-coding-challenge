import { useEffect, useMemo } from 'react';
import { iconSize, usePlotter } from './Plotter';

export interface ConnectionProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export function Connection({ fromX, fromY, toX, toY }: ConnectionProps) {
  const plotter = usePlotter();

  const { from, to } = useMemo(() => {
    const from = plotter.plot(fromX, fromY);
    const to = plotter.plot(toX, toY);
    return { from, to };
  }, [fromX, fromY, plotter, toX, toY]);

  const arrow = useMemo(() => {
    if (from.x === to.x && from.y === to.y) {
      return { from, to };
    }

    // Reduce length of vector by radius of icons
    const difference = { x: to.x - from.x, y: to.y - from.y };
    const length = Math.sqrt(difference.x * difference.x + difference.y * difference.y);
    const unit = { x: difference.x / length, y: difference.y / length };

    return {
      from: {
        x: from.x + (unit.x * iconSize) / 2,
        y: from.y + (unit.y * iconSize) / 2
      },
      to: {
        x: from.x + unit.x * (length - iconSize),
        y: from.y + unit.y * (length - iconSize)
      }
    };
  }, [from, to]);

  useEffect(() => {
    if (fromX === toX && fromY === toY) {
      // TODO: Use warn() context?
      console.warn(`You are drawing a Connection to its own start point: (${fromX}, ${fromY})-->(${toX}, ${toY})`);
    }
  }, [fromX, fromY, toX, toY]);

  if ([fromX, fromY, toX, toY].some(n => !Number.isFinite(n) || isNaN(n))) {
    return null;
  }

  return (
    <g fill="none" strokeWidth={2}>
      <circle cx={from.x} cy={from.y} r={iconSize / 2 - 2} strokeOpacity={0.1} />
      <circle cx={to.x} cy={to.y} r={iconSize / 2 - 2} strokeOpacity={0.1} />
      <line x1={arrow.from.x} y1={arrow.from.y} x2={arrow.to.x} y2={arrow.to.y} markerEnd="url(#TopologyChart-Connection-ArrowHead)" />
    </g>
  );
}

Connection.displayName = 'Connection';
