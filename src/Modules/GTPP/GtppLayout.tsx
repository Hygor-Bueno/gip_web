import React from "react";
import { Outlet } from "react-router-dom";
import { GtppWsProvider } from "./Context/GtppWsContext";

/**
 * Layout route do módulo GTPP. Monta o GtppWsProvider uma única vez
 * para todas as rotas filhas (/GIPP/GTPP, /GIPP/GTPP/create/theme...),
 * evitando que a WebSocket do GTPP e o estado de notificações sejam
 * reiniciados ao navegar entre Tarefas e Temas.
 */
export default function GtppLayout(): JSX.Element {
  return (
    <GtppWsProvider>
      <Outlet />
    </GtppWsProvider>
  );
}
