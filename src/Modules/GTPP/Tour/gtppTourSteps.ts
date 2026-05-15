import { TourStep } from "../../../Components/ProductTour";

export interface BuildGtppTourStepsDeps {
  /** Abre o navbar collapsed antes de medir um nav-link. */
  openNavbar: () => void;
  /** Abre programaticamente a primeira tarefa do quadro. */
  openFirstTask: () => void;
  /** Fecha o modal de detalhe da tarefa se estiver aberto. */
  closeTaskModal: () => void;
}

/**
 * Passos do tour do módulo GTPP (Gerenciador de Tarefas).
 *
 * Cobre: navegação, botões de ação, controles à direita, filtros,
 * quadro Kanban, cartão de tarefa individual e o modal de detalhe.
 *
 * Os textos abaixo são placeholders (lorem ipsum) prontos para edição.
 */
export function buildGtppTourSteps({
  openNavbar,
  openFirstTask,
  closeTaskModal,
}: BuildGtppTourStepsDeps): TourStep[] {
  return [
    // ---------- Navegação ----------
    {
      selector: '[data-tour="navbar-toggle"]',
      title: "Menu de Navegação",
      body:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Botão que expande o menu lateral do GTPP com os atalhos para Home, Tarefas, Temas e Sair.",
      placement: "right",
    },
    {
      selector: '[data-tour="nav-link-/GIPP"]',
      title: "Menu — Home",
      body:
        "Lorem ipsum dolor sit amet. Volta para a tela inicial com a grade de módulos do GIPP.",
      placement: "right",
      setup: openNavbar,
    },
    {
      selector: '[data-tour="nav-link-/GIPP/GTPP"]',
      title: "Menu — Tarefas",
      body:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Atalho para o quadro Kanban principal do GTPP que você está vendo agora.",
      placement: "right",
      setup: openNavbar,
    },
    {
      selector: '[data-tour="nav-link-/GIPP/GTPP/create/theme"]',
      title: "Menu — Temas",
      body:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Crie e edite temas para classificar suas tarefas em categorias visuais.",
      placement: "right",
      setup: openNavbar,
    },
    {
      selector: '[data-tour="nav-link-/"]',
      title: "Menu — Sair",
      body:
        "Lorem ipsum dolor sit amet. Encerra a sessão com segurança removendo o token armazenado localmente.",
      placement: "right",
      setup: openNavbar,
    },

    // ---------- Botões de ação no topo ----------
    {
      selector: '[data-tour^="gtpp-btn-check_adm_"]',
      title: "Modo Administrador",
      body:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Eleva sua sessão para visualizar e gerenciar tarefas de toda a equipe (disponível para usuários com perfil de administrador).",
      placement: "bottom",
    },
    {
      selector: '[data-tour="gtpp-btn-gttp_exp_ret"]',
      title: "Exibir Usuários",
      body:
        "Lorem ipsum dolor sit amet. Mostra ou oculta o cabeçalho com o seu cartão de usuário e informações de equipe.",
      placement: "bottom",
    },
    {
      selector: '[data-tour="gtpp-btn-check_filter"]',
      title: "Filtros da Página",
      body:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Abre o painel completo de filtros: busca por texto, prioridade, datas, usuário vinculado e status.",
      placement: "bottom",
    },
    {
      selector: '[data-tour="gtpp-btn-reload_tasks"]',
      title: "Recarregar Tarefas",
      body:
        "Lorem ipsum dolor sit amet. Faz uma nova chamada ao servidor e limpa os filtros aplicados na tela.",
      placement: "bottom",
    },

    // ---------- Controles à direita do header ----------
    {
      selector: '[data-tour="gtpp-menu-toggle"]',
      title: "Ocultar / Exibir Menu (Mobile)",
      body:
        "Lorem ipsum dolor sit amet. Em telas pequenas, este botão mostra ou esconde o menu lateral para você ter mais espaço para o quadro.",
      placement: "left",
    },
    {
      selector: '[data-tour="gtpp-sound"]',
      title: "Som das Notificações",
      body:
        "Lorem ipsum dolor sit amet. Liga ou desliga o som que toca quando chega uma notificação de tarefa, comentário ou mudança de status.",
      placement: "left",
    },
    {
      selector: '[data-tour="gtpp-bell"]',
      title: "Central de Notificações",
      body:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sino com tudo que aconteceu nas suas tarefas e nas conversas do CLPP. Clique em uma notificação de comentário para abrir direto a subtarefa correspondente.",
      placement: "left",
    },

    // ---------- Filtros do quadro ----------
    {
      selector: '[data-tour="gtpp-themes"]',
      title: "Filtro por Tema",
      body:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Selecione um tema para ver apenas as tarefas relacionadas. "Sem vínculo" mostra as que não foram classificadas.',
      placement: "bottom",
    },
    {
      selector: '[data-tour="gtpp-states"]',
      title: "Filtro de Estados",
      body:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Clique e ative ou desative as colunas do Kanban — útil quando você quer ver só "Em andamento" ou só "Concluídas".',
      placement: "bottom",
    },

    // ---------- Quadro Kanban e botões de coluna ----------
    {
      selector: '[data-tour="gtpp-board"]',
      title: "Quadro Kanban",
      body:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Visão geral do quadro: aqui você enxerga rapidamente em que estado cada tarefa está e como o trabalho da equipe está distribuído.",
      placement: "top",
      setup: closeTaskModal,
    },
    {
      selector: '[data-tour="gtpp-add-task"]',
      title: "Nova Tarefa",
      body:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Abre o formulário de criação de tarefa com título, datas, prioridade, companhia, loja e departamento.",
      placement: "top",
      setup: closeTaskModal,
    },
    {
      selector: '[data-tour="gtpp-export-csv"]',
      title: "Exportar CSV",
      body:
        "Lorem ipsum dolor sit amet. Baixa as tarefas desta coluna em formato CSV para abrir no Excel ou em outras planilhas.",
      placement: "top",
      setup: closeTaskModal,
    },
    {
      selector: '[data-tour="gtpp-export-pdf"]',
      title: "Exportar PDF",
      body:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Abre o gerador de PDF com as tarefas formatadas para impressão ou compartilhamento.",
      placement: "top",
      setup: closeTaskModal,
    },

    // ---------- Tarefa (card individual) ----------
    {
      selector: "#moduleGTPP .card-task-container",
      title: "Cartão de uma Tarefa",
      body:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cada cartão representa uma tarefa. No topo aparece o número e o título, à direita um sino com notificações específicas dessa tarefa, abaixo as datas inicial e final, e no rodapé o ícone do responsável, a barra de progresso e o selo de prioridade (baixa, média, alta).",
      placement: "right",
      setup: closeTaskModal,
    },
    {
      selector: '[data-tour="gtpp-modal-root"]',
      title: "Detalhe da Tarefa",
      body:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ao clicar em um cartão, a tarefa abre nesta visão detalhada. Aqui você gerencia tudo: descrição, equipe, subtarefas, comentários e mudança de estado.",
      placement: "left",
      setup: openFirstTask,
    },
    {
      selector: '[data-tour="gtpp-modal-header"]',
      title: "Cabeçalho da Tarefa",
      body:
        "Lorem ipsum dolor sit amet. Mostra o título da tarefa, a barra de progresso geral e o botão de fechar.",
      placement: "bottom",
      setup: openFirstTask,
    },
    {
      selector: '[data-tour="gtpp-modal-avatars"]',
      title: "Equipe Vinculada",
      body:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lista de usuários atribuídos à tarefa. Você pode adicionar ou remover colaboradores conforme o avanço do trabalho.",
      placement: "bottom",
      setup: openFirstTask,
    },
    {
      selector: '[data-tour="gtpp-modal-action"]',
      title: "Mudar Estado da Tarefa",
      body:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Botão de ação que muda o estado conforme a situação atual: parar, finalizar, retomar, solicitar mais dias, etc.",
      placement: "bottom",
      setup: openFirstTask,
    },
    {
      selector: '[data-tour="gtpp-modal-description"]',
      title: "Descrição",
      body:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Campo principal de descrição da tarefa — explica o contexto, escopo e observações relevantes.",
      placement: "bottom",
      setup: openFirstTask,
    },
    {
      selector: '[data-tour="gtpp-modal-body"]',
      title: "Subtarefas e Ferramentas",
      body:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lista de subtarefas (com checkbox, observações e perguntas), atalhos para Companhia/Loja/Departamento, expandir/retrair e comentários por subtarefa.",
      placement: "top",
      setup: openFirstTask,
    },
  ];
}
