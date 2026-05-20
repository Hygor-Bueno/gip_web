import { TourStep } from "../ProductTour";
// (helper de steps da Home — registrado via useRegisterTour em Home.tsx)

export interface HomeNavItem {
  page: string;
  children: string;
  icon?: string;
}

export interface HomeAccessItem {
  application_id: string;
}

export interface BuildHomeTourStepsDeps {
  listPath: HomeNavItem[];
  accessList: HomeAccessItem[];
  openNavbar: () => void;
}

/** Descrições reais dos módulos do GIPP. */
export const MODULE_DESCRIPTIONS: Record<string, { title: string; body: string }> = {
  "3": {
    title: "GTPP — Gerenciador de Tarefas",
    body:
      "Sistema baseado na metodologia Kanban para organização e acompanhamento de tarefas. Permite maior controle das demandas, produtividade e visualização do fluxo de trabalho da equipe.",
  },
  "19": {
    title: "CFPP — RH",
    body:
      "Módulo responsável pela área de Recursos Humanos. Atualmente cobre o fluxo de vendas de folgas de férias dos colaboradores.",
  },
  "15": {
    title: "GAPP — Gestão de Ativos Peg Pese",
    body:
      "Sistema voltado ao controle e gerenciamento de ativos da empresa, incluindo movimentações, despesas, infrações de trânsito, sinistros e acompanhamento financeiro operacional dos veículos.",
  },
};

/** Descrições reais dos itens do menu lateral. */
export const NAV_DESCRIPTIONS: Record<string, { title: string; body: string }> = {
  "/GIPP": {
    title: "Home",
    body:
      "Volta para a tela inicial com os blocos coloridos de cada módulo que você tem acesso. É de lá que você escolhe entre GTPP (tarefas), GAPP (ativos), CFPP (RH), etc.",
  },
  "/GIPP/configuration/profile": {
    title: "Perfil",
    body:
      "Acessa a página do seu perfil para editar dados pessoais, foto e preferências da conta. É também onde você pode atualizar sua senha quando necessário.",
  },
  "/": {
    title: "Sair",
    body:
      "Encerra a sessão com segurança, remove o token armazenado no navegador e redireciona para a tela de login. Sempre use este botão em computadores compartilhados.",
  },
};

/**
 * Tour da Home: navegação lateral + módulos disponíveis ao usuário.
 * Cada item entra como um nó da árvore agrupado por categoria.
 */
export function buildHomeTourSteps({
  listPath,
  accessList,
  openNavbar,
}: BuildHomeTourStepsDeps): TourStep[] {
  const navbarStep: TourStep = {
    selector: '[data-tour="navbar-toggle"]',
    title: "Botão do Menu",
    body:
      "Esse é o botão hambúrguer que expande ou recolhe o menu lateral. Em telas grandes ele já fica aberto; em celulares aparece recolhido. Reúne atalhos para Home, Perfil e Sair.",
    placement: "right",
    category: "Navegação Lateral",
  };

  const navLinkSteps: TourStep[] = listPath.map((item) => {
    const meta = NAV_DESCRIPTIONS[item.page] ?? {
      title: item.children,
      body: `Atalho para ${item.children}.`,
    };
    return {
      selector: `[data-tour="nav-link-${item.page}"]`,
      title: meta.title,
      body: meta.body,
      placement: "right",
      setup: openNavbar,
      category: "Navegação Lateral",
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
        category: "Módulos disponíveis",
      };
    })
    .filter((s): s is TourStep => s !== null);

  return [navbarStep, ...navLinkSteps, ...moduleSteps];
}
