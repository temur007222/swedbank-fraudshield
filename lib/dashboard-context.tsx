"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface DashboardContextValue {
  isLive: boolean;
  setIsLive: (value: boolean) => void;
}

const DashboardContext = createContext<DashboardContextValue>({
  isLive: false,
  setIsLive: () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [isLive, setIsLive] = useState(false);

  return (
    <DashboardContext.Provider value={{ isLive, setIsLive }}>
      {children}
    </DashboardContext.Provider>
  );
}
