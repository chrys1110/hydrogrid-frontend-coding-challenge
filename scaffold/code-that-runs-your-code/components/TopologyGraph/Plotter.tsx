import { createContext, ReactNode, useContext } from 'react';

interface Plotter {
  calculateSize: () => { width: number; height: number };
  plot: (x: number, y: number) => { x: number; y: number; transform: string };
  inverse: (x: number, y: number, inverse?: boolean) => { x: number; y: number };
}

const PlotterContext = createContext<Plotter | null>(null);

export const iconSize = 40;
const spacing = 40;

interface PlotterInit {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  scale?: number;
}

export function createPlotter({ minX, minY, maxX, maxY, scale = 1 }: PlotterInit): Plotter {
  return {
    calculateSize: () => {
      return {
        width: scale * (iconSize + spacing) * (maxX - minX + 1),
        height: scale * (iconSize + spacing) * (maxY - minY + 1)
      };
    },
    plot: (x, y) => {
      const plottedX = (x - minX) * (iconSize + spacing) + spacing;
      const plottedY = (y - minY) * (iconSize + spacing) + spacing;

      const translate = isNaN(plottedX) || isNaN(plottedY) ? `0 0` : `${plottedX - iconSize / 2} ${plottedY - iconSize / 2}`;

      return {
        x: plottedX,
        y: plottedY,
        transform: `scale(${scale}) translate(${translate})`
      };
    },
    inverse: (plottedX, plottedY, round = false) => {
      let x = (plottedX - spacing) / (iconSize + spacing) + minX;
      let y = (plottedY - spacing) / (iconSize + spacing) + minY;

      if (round) {
        x = Math.max(minX, Math.min(Math.round(x), maxX));
        y = Math.max(minY, Math.min(Math.round(y), maxY));
      }

      return { x, y };
    }
  };
}

interface ProvidePlotterProps {
  plotter: Plotter;
  children: ReactNode;
}

export function ProvidePlotter({ children, plotter }: ProvidePlotterProps) {
  return <PlotterContext.Provider value={plotter}>{children}</PlotterContext.Provider>;
}

export function usePlotter() {
  const plotter = useContext(PlotterContext);
  if (!plotter) {
    throw new Error('usePlotter must be used inside ProvidePlotter hierarchy.');
  }
  return plotter;
}
