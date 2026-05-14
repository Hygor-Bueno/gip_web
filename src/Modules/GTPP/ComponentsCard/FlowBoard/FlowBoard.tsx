import React, { useMemo } from "react";
import { Col } from "react-bootstrap";
import NavBar from "../../../../Components/NavBar";
import { listPath } from "../../mock/configurationfile";
import ColumnTaskState from "../ColumnTask/columnTask";
import CardUser from "../../../CLPP/Components/CardUser";
import NotificationBell from "../../../../Components/NotificationBell";
import Cardregister from "../CardRegister/Cardregister";
import ModalDefault from "../Modal/Modal";
// import PDFGenerator, { generateAndDownloadCSV } from "../../../../Class/FileGenerator";
import PDFGenerator from "../../../../Class/TaskExporter/TaskExporter";
import { FilterPage } from "../Filter/FilterPage";
import { InputCheckButton } from "../../../../Components/CustomButton";
import GtppMainProps from "../../Interfaces/IGtppMainProps";
import "./FlowBoard.css";
import { generateAndDownloadCSV, Task } from "../../../../Class/FileGenerator";
import { useRegisterTourSteps } from "../../../../Context/TourContext";
import { TourStep } from "../../../../Components/ProductTour";

export default function GtppMain(props: GtppMainProps) {
  const openNavbar = React.useCallback(() => {
    const toggle = document.querySelector<HTMLButtonElement>('[data-tour="navbar-toggle"]');
    const collapse = document.querySelector('#basic-navbar-nav');
    const isOpen = collapse?.classList.contains('show');
    if (toggle && !isOpen) toggle.click();
  }, []);

  const tourSteps: TourStep[] = useMemo(() => [
    // --- Navegação ---
    {
      selector: '[data-tour="navbar-toggle"]',
      title: 'Menu de Navegação',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Botão que expande o menu lateral do GTPP com os atalhos para Home, Tarefas, Temas e Sair.',
      placement: 'right',
    },
    {
      selector: '[data-tour="nav-link-/GIPP"]',
      title: 'Menu — Home',
      body: 'Lorem ipsum dolor sit amet. Volta para a tela inicial com a grade de módulos do GIPP.',
      placement: 'right',
      setup: openNavbar,
    },
    {
      selector: '[data-tour="nav-link-/GIPP/GTPP"]',
      title: 'Menu — Tarefas',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Atalho para o quadro Kanban principal do GTPP que você está vendo agora.',
      placement: 'right',
      setup: openNavbar,
    },
    {
      selector: '[data-tour="nav-link-/GIPP/GTPP/create/theme"]',
      title: 'Menu — Temas',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Crie e edite temas para classificar suas tarefas em categorias visuais.',
      placement: 'right',
      setup: openNavbar,
    },
    {
      selector: '[data-tour="nav-link-/"]',
      title: 'Menu — Sair',
      body: 'Lorem ipsum dolor sit amet. Encerra a sessão com segurança removendo o token armazenado localmente.',
      placement: 'right',
      setup: openNavbar,
    },

    // --- Botões de ação no topo ---
    {
      selector: `[data-tour^="gtpp-btn-check_adm_"]`,
      title: 'Modo Administrador',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Eleva sua sessão para visualizar e gerenciar tarefas de toda a equipe (disponível para usuários com perfil de administrador).',
      placement: 'bottom',
    },
    {
      selector: '[data-tour="gtpp-btn-gttp_exp_ret"]',
      title: 'Exibir Usuários',
      body: 'Lorem ipsum dolor sit amet. Mostra ou oculta o cabeçalho com o seu cartão de usuário e informações de equipe.',
      placement: 'bottom',
    },
    {
      selector: '[data-tour="gtpp-btn-check_filter"]',
      title: 'Filtros da Página',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Abre o painel completo de filtros: busca por texto, prioridade, datas, usuário vinculado e status.',
      placement: 'bottom',
    },
    {
      selector: '[data-tour="gtpp-btn-reload_tasks"]',
      title: 'Recarregar Tarefas',
      body: 'Lorem ipsum dolor sit amet. Faz uma nova chamada ao servidor e limpa os filtros aplicados na tela.',
      placement: 'bottom',
    },

    // --- Controles à direita do header ---
    {
      selector: '[data-tour="gtpp-menu-toggle"]',
      title: 'Ocultar / Exibir Menu (Mobile)',
      body: 'Lorem ipsum dolor sit amet. Em telas pequenas, este botão mostra ou esconde o menu lateral para você ter mais espaço para o quadro.',
      placement: 'left',
    },
    {
      selector: '[data-tour="gtpp-sound"]',
      title: 'Som das Notificações',
      body: 'Lorem ipsum dolor sit amet. Liga ou desliga o som que toca quando chega uma notificação de tarefa, comentário ou mudança de status.',
      placement: 'left',
    },
    {
      selector: '[data-tour="gtpp-bell"]',
      title: 'Central de Notificações',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sino com tudo que aconteceu nas suas tarefas e nas conversas do CLPP. Clique em uma notificação de comentário para abrir direto a subtarefa correspondente.',
      placement: 'left',
    },

    // --- Filtros do quadro ---
    {
      selector: '[data-tour="gtpp-themes"]',
      title: 'Filtro por Tema',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Selecione um tema para ver apenas as tarefas relacionadas. "Sem vínculo" mostra as que não foram classificadas.',
      placement: 'bottom',
    },
    {
      selector: '[data-tour="gtpp-states"]',
      title: 'Filtro de Estados',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Clique e ative ou desative as colunas do Kanban — útil quando você quer ver só "Em andamento" ou só "Concluídas".',
      placement: 'bottom',
    },

    // --- Quadro Kanban e botões de coluna ---
    {
      selector: '[data-tour="gtpp-board"]',
      title: 'Quadro Kanban',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aqui ficam suas tarefas distribuídas pelos estados ativos. Clique em uma tarefa para abrir o detalhe, gerenciar subtarefas, comentários e vincular usuários.',
      placement: 'top',
    },
    {
      selector: '[data-tour="gtpp-add-task"]',
      title: 'Nova Tarefa',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Abre o formulário de criação de tarefa com título, datas, prioridade, companhia, loja e departamento.',
      placement: 'top',
    },
    {
      selector: '[data-tour="gtpp-export-csv"]',
      title: 'Exportar CSV',
      body: 'Lorem ipsum dolor sit amet. Baixa as tarefas desta coluna em formato CSV para abrir no Excel ou em outras planilhas.',
      placement: 'top',
    },
    {
      selector: '[data-tour="gtpp-export-pdf"]',
      title: 'Exportar PDF',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Abre o gerador de PDF com as tarefas formatadas para impressão ou compartilhamento.',
      placement: 'top',
    },
  ], [openNavbar]);

  useRegisterTourSteps(tourSteps, [tourSteps]);

  function HeaderFilters() {
    return (
      <div className="d-flex w-100 align-items-center justify-content-start gap-5 mt-3">
        <div className="d-flex gap-4 mb-3 flex-wrap" data-tour="gtpp-themes">
          <div>
            <label className="form-label mb-1">Filtrar pelo tema:</label>
            <select className="form-select" value={props.selectedThemeIds} onChange={(e) => props.setSelectedThemeIds(e.target.value)}>
              <option value="" hidden>Selecione</option>
              <option value="">Todos</option>
              <option value="0">Sem vinculo</option>
              {props?.themeList?.map((theme) => (
                <option key={theme.id_theme} value={theme.id_theme}>
                  {theme.description_theme}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="position-relative" data-tour="gtpp-states">
          <h1 onClick={props.handleOpenFilter} className="cursor-pointer d-inline-flex align-items-center gap-2">
            Estados <i className="fa fa-angle-down"></i>
          </h1>
          {props.openFilter && (
            <div className="position-absolute bg-white shadow rounded border p-3 mt-2 z-10" style={{ minWidth: "220px", zIndex: "1" }}>
              {props.states?.map((state: any) => (
                <div key={state.id} className="d-flex align-items-center mb-2">
                  <input
                    id={`filter_state_${state.id}`}
                    className="form-check-input me-2"
                    type="checkbox"
                    checked={state.active}
                    onChange={() => props.handleCheckboxChange(state.id)}
                  />
                  <label htmlFor={`filter_state_${state.id}`} className="form-check-label">
                    {state.description}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  function ContentDefault() {
    return (
      <Col xs={12} data-tour="gtpp-board" className="d-flex flex-nowrap p-0 menu-expansivo flex-grow-1" style={{ overflowX: "auto", height: "70%" }}>
        {props.states?.map((state: any, idx) => {
          const x = props.getTask;
          const filteredTasks = x.filter((t) => t.state_id === state.id);
          const isFirstColumn = idx === 0;

          return (
            
            state.active && (
              <div key={state.id} className="column-task-container p-2 flex-shrink-0">
                <ColumnTaskState
                  theme_id_fk={props.selectedThemeIds}
                  setSelectedTasks={props.setSelectedTasks}
                  title={state.description}
                  bg_color={state.color}
                  is_first_column={isFirstColumn}
                  addTask={() => {
                    props.setModalPageElement(<Cardregister reloadtask={props.loadTasks} assistenceFunction={() => props.setModalPage(false)} onClose={() => props.setModalPage(false)} />);
                    props.setModalPage(true);
                  }}
                  exportCsv={() => generateAndDownloadCSV(filteredTasks as unknown as Task[], "GTPP-documento")}
                  exportPdf={() => {
                    props.setModalPageElement(
                      <div className="card w-75 position-relative bg-white">
                        <div className="d-flex justify-content-end p-3">
                          <button className="btn-close" onClick={() => props.setModalPage(false)}></button>
                        </div>
                        <div className="overflow-auto p-4" style={{ maxHeight: "80vh" }}>
                          <PDFGenerator data={filteredTasks as unknown as Task[]} />
                        </div>
                      </div>
                    );
                    props.setModalPage(true);
                  }}
                  content_body={filteredTasks}
                />
              </div>
            ));
        })}
      </Col>
    )
  }

  function ModalThemeRegisterTask() {
    return (
      <div className="bg-dark">
        <div className="position-absolute flowboard-head">
          <div className="flowboard-body w-100 p-2">
            <div className="d-flex justify-content-between">
              <h2>Qual tema deseja vincular as tarefas?</h2>
              <button onClick={() => props.setOpenThemeModal(false)} className="fa fa-solid fa-x btn btn-danger"></button>
            </div>
            <hr />
            <div>
              <select className="w-100 form-select" onChange={(e) => console.log(false)}>
                <option value="" hidden>Selecione</option>
              </select>
            </div>
            <div className="pt-2">
              <button onClick={() => props.setOpenThemeModal(false)} className="btn btn-primary">Enviar</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="moduleGTPP" className="d-flex flex-row h-100 w-100 position-relative container-fluid m-0 p-0">
      {props.openThemeModal && <ModalThemeRegisterTask />}      
      {props.openMenu && <NavBar list={listPath} />}
      {props.openFilterGolbal && <FilterPage />}
      <div className="h-100 d-flex overflow-hidden px-3 flex-grow-1">
        <div className="flex-grow-1 d-flex flex-column justify-content-between align-items-start h-100 overflow-hidden">
          <div className="d-flex flex-column justify-content-between w-100">
            <div className="flex-grow-1 me-2 w-100">{props.isHeader ? <CardUser {...props.userLog} name={props.userLog.name} /> : null}</div>
            <div className="d-flex justify-content-between">
              <div className="d-flex flex-row mt-2 gap-2 flex-wrap">
                {props.listButtonInputs.map((btn: any, idx: number) => (
                  <span key={`btn_header_gtpp_${idx}`} data-tour={`gtpp-btn-${btn.inputId}`}>
                    <InputCheckButton {...btn} />
                  </span>
                ))}
              </div>
              <div className="d-flex gap-3 align-items-center">
                <React.Fragment>
                  <button data-tour="gtpp-menu-toggle" title={props.openMenu ? "Ocultar menu" : "Exibir menu"} onClick={() => props.setOpenMenu(!props.openMenu)} className="btn p-0 d-block d-md-none">
                    <i className={`fa-solid fa-eye${props.openMenu ? "-slash" : ""}`}></i>
                  </button>
                  <button data-tour="gtpp-sound" title={props.onSounds ? "Som ligado" : "Som desligado"} onClick={() => props.setOnSounds(!props.onSounds)} className="btn p-0">
                    <i className={`fa-solid fa-volume-${props.onSounds ? "high" : "xmark"}`}></i>
                  </button>
                </React.Fragment>
                <span data-tour="gtpp-bell"><NotificationBell /></span>
              </div>
            </div>
          </div>
          <HeaderFilters />
          <ContentDefault />
        </div>
        {props.openCardDefault && (
          <ModalDefault
            taskFilter={props.task}
            details={props.taskDetails}
            close_modal={() => {
              props.setOpenCardDefault(false);
              props.clearGtppWsContext();
            }}
          />
        )}
      </div>
    </div>
  );
}