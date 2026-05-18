import { TourStep } from "../../../Components/ProductTour";

export interface BuildGtppTourStepsDeps {
  /** Abre o navbar collapsed antes de medir um nav-link. */
  openNavbar: () => void;
  /** Abre programaticamente a primeira tarefa do quadro. */
  openFirstTask: () => void;
  /** Abre a primeira tarefa e dispara o painel de comentários. */
  openFirstTaskComments: () => void;
  /** Fecha o modal de detalhe da tarefa se estiver aberto. */
  closeTaskModal: () => void;
}

/**
 * Passos do tour do módulo GTPP. Organizados em árvore (category +
 * subcategory) para o usuário navegar como uma documentação técnica.
 *
 * Categorias usadas:
 *   - Navegação Lateral
 *   - Cabeçalho do Quadro     ├── Ações principais
 *                             └── Controles laterais
 *   - Filtros do Quadro
 *   - Quadro Kanban           ├── Coluna
 *                             └── Cartão da Tarefa
 *   - Detalhe da Tarefa       ├── Cabeçalho
 *                             ├── Subtarefas
 *                             └── Comentários
 */
export function buildGtppTourSteps({
  openNavbar,
  openFirstTask,
  openFirstTaskComments,
  closeTaskModal,
}: BuildGtppTourStepsDeps): TourStep[] {
  return [
    // ════ Navegação Lateral ════════════════════════════════════════════
    {
      category: "Navegação Lateral",
      selector: '[data-tour="navbar-toggle"]',
      title: "Botão do Menu",
      body:
        "Esse é o botão hambúrguer que expande ou recolhe o menu lateral. Em telas grandes ele já aparece aberto; em celulares fica recolhido por padrão. O menu reúne os atalhos para Home, Tarefas, Temas e Sair.",
      placement: "right",
    },
    {
      category: "Navegação Lateral",
      selector: '[data-tour="nav-link-/GIPP"]',
      title: "Home",
      body:
        "Volta para a tela inicial do GIPP, onde ficam os blocos coloridos com cada módulo (GTPP, GAPP, CFPP, etc.). Use quando quiser sair do quadro e escolher outra ferramenta.",
      placement: "right",
      setup: openNavbar,
    },
    {
      category: "Navegação Lateral",
      selector: '[data-tour="nav-link-/GIPP/GTPP"]',
      title: "Tarefas",
      body:
        "Atalho para o quadro Kanban principal do GTPP que você está vendo agora. Útil para voltar rapidamente quando você navega para a tela de Temas.",
      placement: "right",
      setup: openNavbar,
    },
    {
      category: "Navegação Lateral",
      selector: '[data-tour="nav-link-/GIPP/GTPP/create/theme"]',
      title: "Temas",
      body:
        "Vai para a tela de cadastro de temas. Temas são categorias coloridas que você pode atribuir a uma tarefa para agrupar trabalhos relacionados (ex.: 'Manutenção predial', 'TI', 'Auditoria').",
      placement: "right",
      setup: openNavbar,
    },
    {
      category: "Navegação Lateral",
      selector: '[data-tour="nav-link-/"]',
      title: "Sair",
      body:
        "Encerra a sua sessão com segurança, limpa o token armazenado no navegador e redireciona para a tela de login. Sempre use este botão em computadores compartilhados.",
      placement: "right",
      setup: openNavbar,
    },

    // ════ Cabeçalho do Quadro ═════════════════════════════════════════
    {
      category: "Cabeçalho do Quadro",
      subcategory: "Ações principais",
      selector: '[data-tour^="gtpp-btn-check_adm_"]',
      title: "Modo Administrador",
      body:
        "Para usuários com perfil administrativo, este toggle eleva a sessão e mostra as tarefas de toda a equipe, não só as suas. Útil para gerentes que precisam ter visão global do andamento do trabalho.",
      placement: "bottom",
    },
    {
      category: "Cabeçalho do Quadro",
      subcategory: "Ações principais",
      selector: '[data-tour="gtpp-btn-gttp_exp_ret"]',
      title: "Exibir Usuários",
      body:
        "Mostra ou esconde o cartão de cabeçalho com seus dados (nome, foto, equipe). Esconda para ganhar espaço vertical no quadro quando estiver gerenciando muitas tarefas em telas menores.",
      placement: "bottom",
    },
    {
      category: "Cabeçalho do Quadro",
      subcategory: "Ações principais",
      selector: '[data-tour="gtpp-btn-check_filter"]',
      title: "Filtros da Página",
      body:
        "Abre o painel completo de filtros: busca por texto, prioridade (baixa, média, alta), faixa de datas inicial e final, e filtro por usuário atribuído. É o filtro global do quadro, diferente do filtro por coluna.",
      placement: "bottom",
    },
    {
      category: "Cabeçalho do Quadro",
      subcategory: "Ações principais",
      selector: '[data-tour="gtpp-btn-reload_tasks"]',
      title: "Recarregar Tarefas",
      body:
        "Força uma nova busca no servidor e limpa todos os filtros aplicados. Use quando você sabe que houve mudança no banco e o WebSocket pode ter perdido a atualização (raro, mas possível em queda de conexão).",
      placement: "bottom",
    },
    {
      category: "Cabeçalho do Quadro",
      subcategory: "Controles laterais",
      selector: '[data-tour="gtpp-menu-toggle"]',
      title: "Ocultar/Exibir Menu (Mobile)",
      body:
        "Botão visível apenas em telas pequenas. Esconde o menu lateral para deixar mais espaço ao quadro Kanban. Em desktop o menu fica sempre aberto.",
      placement: "left",
    },
    {
      category: "Cabeçalho do Quadro",
      subcategory: "Controles laterais",
      selector: '[data-tour="gtpp-sound"]',
      title: "Som das Notificações",
      body:
        "Liga ou desliga o som que toca quando chega uma notificação. O som ajuda quando você está com a aba em segundo plano. Mantenha desligado em reuniões ou ambientes silenciosos.",
      placement: "left",
    },
    {
      category: "Cabeçalho do Quadro",
      subcategory: "Controles laterais",
      selector: '[data-tour="gtpp-bell"]',
      title: "Central de Notificações",
      body:
        "O sino acumula tudo que aconteceu nas suas tarefas: comentários novos, mudanças de status, alterações em descrições e vínculos de usuários. Clique para ver a lista e marcar como lida. O número vermelho indica quantas notificações não lidas você tem.",
      placement: "left",
    },

    // ════ Filtros do Quadro ════════════════════════════════════════════
    {
      category: "Filtros do Quadro",
      selector: '[data-tour="gtpp-themes"]',
      title: "Filtro por Tema",
      body:
        'Mostra apenas as tarefas com o tema selecionado. "Todos" exibe tudo; "Sem vínculo" mostra só as tarefas que ainda não foram classificadas. Útil quando o quadro está cheio e você quer focar em um projeto específico.',
      placement: "bottom",
    },
    {
      category: "Filtros do Quadro",
      selector: '[data-tour="gtpp-states"]',
      title: "Filtro de Estados",
      body:
        'Controla quais colunas do Kanban aparecem. Por padrão todas estão visíveis; se você quer ver apenas "Em andamento" e "Concluído", por exemplo, desmarque as outras aqui. A configuração fica salva no seu navegador.',
      placement: "bottom",
    },

    // ════ Quadro Kanban ════════════════════════════════════════════════
    {
      category: "Quadro Kanban",
      selector: '[data-tour="gtpp-board"]',
      title: "Visão Geral do Quadro",
      body:
        "O quadro Kanban distribui as tarefas em colunas por estado: Não iniciado, Em andamento, Pausado, Concluído, Cancelado, etc. Você lê o quadro da esquerda para a direita acompanhando o fluxo de trabalho da equipe.",
      placement: "top",
      setup: closeTaskModal,
    },
    {
      category: "Quadro Kanban",
      subcategory: "Coluna",
      selector: '[data-tour="gtpp-add-task"]',
      title: "Criar Nova Tarefa",
      body:
        "Disponível apenas na primeira coluna. Abre o formulário de criação onde você define título, datas inicial e final, prioridade, e o trio Companhia → Loja → Departamento que vincula a tarefa a uma unidade da empresa.",
      placement: "top",
      setup: closeTaskModal,
    },
    {
      category: "Quadro Kanban",
      subcategory: "Coluna",
      selector: '[data-tour="gtpp-export-csv"]',
      title: "Exportar CSV",
      body:
        "Baixa as tarefas desta coluna em formato CSV (compatível com Excel e Google Sheets). Use para gerar relatórios externos, fazer análises ou compartilhar dados com pessoas fora da plataforma.",
      placement: "top",
      setup: closeTaskModal,
    },
    {
      category: "Quadro Kanban",
      subcategory: "Coluna",
      selector: '[data-tour="gtpp-export-pdf"]',
      title: "Exportar PDF",
      body:
        "Gera um PDF formatado com as tarefas desta coluna. Ideal para imprimir, anexar em e-mails ou arquivar em pastas de documentação. O layout é otimizado para impressão A4.",
      placement: "top",
      setup: closeTaskModal,
    },
    {
      category: "Quadro Kanban",
      subcategory: "Cartão da Tarefa",
      selector: "#moduleGTPP .card-task-container",
      title: "Anatomia do Cartão",
      body:
        "Cada cartão representa uma tarefa. Você vê: o número da tarefa (#ID) no topo, o título logo abaixo, à direita um sino com notificações específicas dela, as datas inicial e final, e no rodapé o ícone do responsável, a barra de progresso e o selo colorido de prioridade (azul=baixa, amarelo=média, vermelho=alta).",
      placement: "right",
      setup: closeTaskModal,
    },

    // ════ Detalhe da Tarefa ════════════════════════════════════════════
    {
      category: "Detalhe da Tarefa",
      subcategory: "Cabeçalho",
      selector: '[data-tour="gtpp-modal-root"]',
      title: "Modal de Detalhe",
      body:
        "Ao clicar em um cartão, a tarefa abre nesta visão completa. Aqui é onde acontece todo o trabalho real: descrição da demanda, equipe vinculada, lista de subtarefas, comentários, mudança de estado, anexos, etc.",
      placement: "left",
      setup: openFirstTask,
    },
    {
      category: "Detalhe da Tarefa",
      subcategory: "Cabeçalho",
      selector: '[data-tour="gtpp-modal-header"]',
      title: "Título e Progresso Geral",
      body:
        "Exibe o nome da tarefa no topo, uma barra verde indicando o percentual de conclusão geral (calculado a partir das subtarefas marcadas), e o botão de fechar à direita. A barra atualiza em tempo real conforme você marca itens como concluídos.",
      placement: "bottom",
      setup: openFirstTask,
    },
    {
      category: "Detalhe da Tarefa",
      subcategory: "Cabeçalho",
      selector: '[data-tour="gtpp-modal-avatars"]',
      title: "Equipe Vinculada",
      body:
        "Mostra os usuários atualmente atribuídos à tarefa em formato de fotos circulares sobrepostas. Clique para abrir a lista completa, adicionar novos colaboradores ou remover quem não está mais envolvido.",
      placement: "bottom",
      setup: openFirstTask,
    },
    {
      category: "Detalhe da Tarefa",
      subcategory: "Cabeçalho",
      selector: '[data-tour="gtpp-modal-action"]',
      title: "Mudar Estado da Tarefa",
      body:
        "Botão dinâmico que muda de acordo com o estado atual. Se está em andamento, vira 'Parar' ou 'Finalizar'; se está parada, vira 'Retomar' ou 'Solicitar mais dias'. Acompanha o ciclo de vida natural da tarefa e dispensa menus complicados.",
      placement: "bottom",
      setup: openFirstTask,
    },
    {
      category: "Detalhe da Tarefa",
      subcategory: "Subtarefas",
      selector: '[data-tour="gtpp-modal-description"]',
      title: "Descrição",
      body:
        "Campo principal para descrever o que precisa ser feito. Aqui você documenta contexto, escopo, links de referência, requisitos e qualquer informação importante para quem for executar. Edição é colaborativa em tempo real via WebSocket.",
      placement: "bottom",
      setup: openFirstTask,
    },
    {
      category: "Detalhe da Tarefa",
      subcategory: "Subtarefas",
      selector: '[data-tour="gtpp-modal-body"]',
      title: "Lista de Subtarefas",
      body:
        "Quebra a tarefa em passos menores e mais gerenciáveis. Cada item tem checkbox para marcar como concluído, suporta observações, perguntas com resposta sim/não, anexos de arquivos e vínculo de um responsável específico. O progresso geral da tarefa é calculado a partir desses checks.",
      placement: "top",
      setup: openFirstTask,
    },

    // ════ Comentários ══════════════════════════════════════════════════
    {
      category: "Detalhe da Tarefa",
      subcategory: "Comentários",
      selector: '[data-tour="gtpp-comments-trigger"]',
      title: "Abrir Comentários da Subtarefa",
      body:
        "O ícone de compartilhar (seta inclinada) ao lado de cada subtarefa abre o painel de comentários daquele item. O número à direita indica quantos comentários já existem. Clique para entrar na conversa.",
      placement: "right",
      setup: openFirstTask,
    },
    {
      category: "Detalhe da Tarefa",
      subcategory: "Comentários",
      selector: '[data-tour="gtpp-comments-panel"]',
      title: "Painel de Comentários",
      body:
        "Painel flutuante que abre ao lado do modal. Funciona como um mini-chat: cada subtarefa tem sua própria conversa, separada das demais. Mensagens novas chegam em tempo real via WebSocket — não precisa atualizar a página.",
      placement: "left",
      setup: openFirstTaskComments,
    },
    {
      category: "Detalhe da Tarefa",
      subcategory: "Comentários",
      selector: '[data-tour="gtpp-comments-header"]',
      title: "Cabeçalho do Chat",
      body:
        "Mostra o título 'Comentários' e logo abaixo o nome da subtarefa que está aberta. É a sua bússola dentro do painel — confira sempre se você está comentando no item certo, especialmente quando alterna entre vários itens.",
      placement: "left",
      setup: openFirstTaskComments,
    },
    {
      category: "Detalhe da Tarefa",
      subcategory: "Comentários",
      selector: '[data-tour="gtpp-comments-close"]',
      title: "Fechar Chat",
      body:
        "O X vermelho fecha o painel e volta o foco para a lista de subtarefas. Use sempre que terminar de conversar em um item e quiser abrir o chat de outro. Só é possível ter um painel aberto por vez.",
      placement: "left",
      setup: openFirstTaskComments,
    },
    {
      category: "Detalhe da Tarefa",
      subcategory: "Comentários",
      selector: '[data-tour="gtpp-comments-list"]',
      title: "Histórico de Mensagens",
      body:
        "Área central que lista todos os comentários da subtarefa, mais antigos no topo. Cada balão mostra foto, nome, texto e horário do autor. Os seus aparecem do lado direito; os de outros usuários, do lado esquerdo. Se houver muitos, a barra de scroll fica ativa e um botão verde aparece para voltar rapidamente ao final.",
      placement: "left",
      setup: openFirstTaskComments,
    },
    {
      category: "Detalhe da Tarefa",
      subcategory: "Comentários",
      selector: '[data-tour="gtpp-comments-attach"]',
      title: "Anexar Arquivo",
      body:
        "Botão circular à esquerda da caixa de texto. Permite anexar arquivos (PDF, imagem, documento) que vão junto com o comentário. Você também pode colar uma imagem direto do Print Screen no campo de texto que ela é detectada automaticamente.",
      placement: "top",
      setup: openFirstTaskComments,
    },
    {
      category: "Detalhe da Tarefa",
      subcategory: "Comentários",
      selector: '[data-tour="gtpp-comments-textbox"]',
      title: "Campo de Mensagem",
      body:
        "Digite seu comentário aqui. Limite de 1000 caracteres com contador no canto direito. Pressione Enter para enviar ou clique no botão verde ao lado. Mínimo de 3 caracteres para evitar comentários vazios — exceto quando você está enviando só um anexo.",
      placement: "top",
      setup: openFirstTaskComments,
    },
    {
      category: "Detalhe da Tarefa",
      subcategory: "Comentários",
      selector: '[data-tour="gtpp-comments-send"]',
      title: "Enviar Comentário",
      body:
        "Botão verde de envio (avião de papel). Fica desabilitado se não houver texto nem anexo. Ao clicar, o comentário é enviado, sincronizado via WebSocket para os demais usuários, e o sino dos colegas que acompanham essa tarefa pisca com a notificação correspondente.",
      placement: "top",
      setup: openFirstTaskComments,
    },
  ];
}
