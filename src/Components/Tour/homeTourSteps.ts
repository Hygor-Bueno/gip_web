import { TourStep } from "../ProductTour";

export interface HomeNavItem {
  page: string;
  children: string;
  icon?: string;
}

export interface HomeAccessItem {
  application_id: string;
}

export interface BuildHomeTourStepsDeps {
  /** Lista de itens do navbar lateral (Home, Perfil, Sair). */
  listPath: HomeNavItem[];
  /** Lista de módulos aos quais o usuário tem acesso (vinda do backend). */
  accessList: HomeAccessItem[];
  /** Abre o navbar collapsed antes de medir um nav-link. */
  openNavbar: () => void;
}

/** Descrições dos módulos exibidas no tour. Editar à vontade. */
export const MODULE_DESCRIPTIONS: Record<string, { title: string; body: string }> = {
  "3": {
    title: "GTPP — Gerenciador de Tarefas",
    body:
      "Sistema baseado na metodologia Kanban para organização e acompanhamento de tarefas. Permite maior controle das demandas, produtividade e visualização do fluxo de trabalho.",
  },

  "19": {
    title: "CFPP — RH",
    body:
      "Modulo responsavel pelo RH - Vendas de folgas de ferias",
  },

  "15": {
    title: "GAPP — Gestão de Ativos PegPese",
    body:
      "Sistema voltado ao controle e gerenciamento de ativos da empresa, incluindo movimentações, despesas, infrações e acompanhamento financeiro operacional.",
  },
};

/** Descrições dos itens do menu lateral exibidas no tour. */
export const NAV_DESCRIPTIONS: Record<string, { title: string; body: string }> = {
  "/GIPP": {
    title: "Menu — Home",
    body:
      "Responsavel para navegar até a pagina onde se localiza os modulos",
  },
  "/GIPP/configuration/profile": {
    title: "Menu — Perfil",
    body:
      "Resposavel para navegar até a pagina de perfil do usuário.",
  },
  "/": {
    title: "Menu — Sair",
    body:
      "Encerra a sessão e volta para pagina de login",
  },
};

/**
 * Passos do tour da Home: navbar + cada item do menu + cada módulo
 * disponível no accessList do usuário.
 */
export function buildHomeTourSteps({
  listPath,
  accessList,
  openNavbar,
}: BuildHomeTourStepsDeps): TourStep[] {
  const navbarStep: TourStep = {
    selector: '[data-tour="navbar-toggle"]',
    title: "Menu de Navegação",
    body:
      "Aqui você expande o menu lateral com as opções principais do GIPP: voltar à Home, perfil e sair. Use sempre que precisar trocar de contexto.",
    placement: "right",
  };

  const navLinkSteps: TourStep[] = listPath.map((item) => {
    const meta = NAV_DESCRIPTIONS[item.page] ?? {
      title: `Menu — ${item.children}`,
      body: "Lorem ipsum dolor sit amet.",
    };
    return {
      selector: `[data-tour="nav-link-${item.page}"]`,
      title: meta.title,
      body: meta.body,
      placement: "right",
      setup: openNavbar,
    };
  });

  const moduleSteps: TourStep[] = (accessList ?? [])
    .map((item): TourStep | null => {
      const meta = MODULE_DESCRIPTIONS[item.application_id];
      if (!meta) return null;
      return {
        selector: `[data-tour="module-${item.application_id}"]`,
        title: meta.title,
        body: meta.body,
        placement: "bottom",
      };
    })
    .filter((s): s is TourStep => s !== null);

  return [navbarStep, ...navLinkSteps, ...moduleSteps];
}
