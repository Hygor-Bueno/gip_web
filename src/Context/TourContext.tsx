import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import ProductTour, { TourStep } from "../Components/ProductTour";

export interface TourMeta {
  /** Rótulo exibido no botão do header. */
  label: string;
  /** Classe Font Awesome do ícone (ex.: "fa-solid fa-book"). */
  icon: string;
  steps: TourStep[];
}

interface RegisteredTour extends TourMeta {
  id: string;
}

interface TourContextValue {
  /** Tours registrados atualmente (ordem de registro). */
  tours: RegisteredTour[];
  /** Registra/atualiza um tour por id. */
  registerTour: (id: string, meta: TourMeta) => void;
  /** Remove um tour por id. */
  unregisterTour: (id: string) => void;
  /** Abre um tour específico pelo id. */
  open: (id: string) => void;
  close: () => void;
  openId: string | null;
}

const TourContext = createContext<TourContextValue | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tourMap, setTourMap] = useState<Record<string, RegisteredTour>>({});
  const [order, setOrder] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const registerTour = useCallback((id: string, meta: TourMeta) => {
    setTourMap((prev) => ({ ...prev, [id]: { id, ...meta } }));
    setOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const unregisterTour = useCallback((id: string) => {
    setTourMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setOrder((prev) => prev.filter((x) => x !== id));
    setOpenId((cur) => (cur === id ? null : cur));
  }, []);

  const open = useCallback((id: string) => {
    setOpenId(id);
  }, []);

  const close = useCallback(() => setOpenId(null), []);

  const tours = useMemo(
    () => order.map((id) => tourMap[id]).filter(Boolean),
    [order, tourMap]
  );

  const activeSteps = openId ? tourMap[openId]?.steps ?? [] : [];

  const value = useMemo<TourContextValue>(
    () => ({ tours, registerTour, unregisterTour, open, close, openId }),
    [tours, registerTour, unregisterTour, open, close, openId]
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      <ProductTour open={!!openId} steps={activeSteps} onClose={close} />
    </TourContext.Provider>
  );
};

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour deve ser usado dentro de um TourProvider");
  return ctx;
}

/**
 * Registra um tour nomeado e mantém seus steps atualizados.
 *
 * IMPORTANTE: a atualização (deps muda) e a remoção (unmount) são efeitos
 * SEPARADOS de propósito. Se fossem o mesmo efeito, cada mudança de deps
 * dispararia unregister→register, e o unregister zerava o `openId` — o
 * que fechava o tour sozinho assim que um `setup` mexia em algum estado
 * que recompõe os steps (ex.: abrir o painel de filtros, ligar admin).
 *
 * @param id    identificador único (ex.: "gtpp", "gtpp-admin")
 * @param meta  { label, icon, steps }
 * @param deps  dependências que disparam a atualização dos steps
 */
export function useRegisterTour(id: string, meta: TourMeta, deps: React.DependencyList): void {
  const { registerTour, unregisterTour } = useTour();

  // Atualiza/registra sempre que os deps mudam — sem remover.
  useEffect(() => {
    registerTour(id, meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Remove apenas no unmount real do componente dono do tour.
  useEffect(() => {
    return () => unregisterTour(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
