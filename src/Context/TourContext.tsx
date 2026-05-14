import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import ProductTour, { TourStep } from "../Components/ProductTour";

interface TourContextValue {
  steps: TourStep[];
  setSteps: (steps: TourStep[]) => void;
  open: () => void;
  close: () => void;
  isOpen: boolean;
  hasSteps: boolean;
}

const TourContext = createContext<TourContextValue | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [steps, setStepsState] = useState<TourStep[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const setSteps = useCallback((next: TourStep[]) => setStepsState(next), []);
  const open = useCallback(() => {
    if (steps.length > 0) setIsOpen(true);
  }, [steps.length]);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<TourContextValue>(
    () => ({ steps, setSteps, open, close, isOpen, hasSteps: steps.length > 0 }),
    [steps, setSteps, open, close, isOpen]
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      <ProductTour open={isOpen} steps={steps} onClose={close} />
    </TourContext.Provider>
  );
};

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour deve ser usado dentro de um TourProvider");
  return ctx;
}

/** Registra os steps quando o componente monta e limpa no unmount. */
export function useRegisterTourSteps(steps: TourStep[], deps: React.DependencyList): void {
  const { setSteps } = useTour();
  useEffect(() => {
    setSteps(steps);
    return () => setSteps([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
