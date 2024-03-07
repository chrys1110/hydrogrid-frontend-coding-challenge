import { createContext, ReactNode, useContext } from 'react';

const InteractiveGraphContext = createContext(false);

export function MakeChartInteractive({ children }: { children: ReactNode }) {
  return <InteractiveGraphContext.Provider value={true}>{children}</InteractiveGraphContext.Provider>;
}

export function useIsChartInteractive() {
  return useContext(InteractiveGraphContext);
}
