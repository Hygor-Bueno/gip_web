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
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aqui o usuário cria, acompanha e fecha tarefas com subtarefas, comentários e quadro Kanban em tempo real. Lorem ipsum dolor sit amet.",
  },
  "19": {
    title: "CFPP — Configurações",
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Centro de configurações do sistema: permissões, departamentos, parâmetros gerais. Lorem ipsum dolor sit amet.",
  },
  "15": {
    title: "GAPP — Gestão de Ativos",
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cadastro e movimentação de ativos, infrações, despesas de loja, controle financeiro. Lorem ipsum dolor sit amet.",
  },
};

/** Descrições dos itens do menu lateral exibidas no tour. */
export const NAV_DESCRIPTIONS: Record<string, { title: string; body: string }> = {
  "/GIPP": {
    title: "Menu — Home",
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Retorna para a tela inicial com a grade de módulos disponíveis para o seu usuário.",
  },
  "/GIPP/configuration/profile": {
    title: "Menu — Perfil",
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Edite seus dados pessoais, foto de perfil e preferências de conta.",
  },
  "/": {
    title: "Menu — Sair",
    body:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Encerra a sessão atual com segurança, removendo o token armazenado.",
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
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aqui você expande o menu lateral com as opções principais do GIPP: voltar à Home, perfil e sair. Use sempre que precisar trocar de contexto.",
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
