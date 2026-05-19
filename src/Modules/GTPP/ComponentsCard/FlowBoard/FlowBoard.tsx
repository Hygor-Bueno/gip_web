import React, { useEffect, useMemo } from "react";
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
import { useWebSocket } from "../../Context/GtppWsContext";
import { buildGtppTourSteps } from "../../Tour/gtppTourSteps";

type PeriodPreset = "week" | "month" | "overdue";

function isoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildPeriodPreset(kind: PeriodPreset): { from: string; to: string } {
  const today = new Date();
  if (kind === "week") {
    const day = today.getDay();
    const monday = new Date(today); monday.setDate(today.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    return { from: isoDate(monday), to: isoDate(sunday) };
  }
  if (kind === "month") {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { from: isoDate(first), to: isoDate(last) };
  }
  // Vencidas: do início dos tempos até ontem
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  return { from: "", to: isoDate(yesterday) };
}

function computeAdminKpis(tasks: Array<{ final_date?: string; percent?: number; user_id?: number }>) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today); in7Days.setDate(today.getDate() + 7);
  let overdue = 0;
  let dueSoon = 0;
  let orphan = 0;
  let percentSum = 0;
  let percentCount = 0;
  tasks.forEach((t) => {
    const pct = Number(t.percent ?? 0);
    if (!t.user_id) orphan++;
    percentSum += pct;
    percentCount++;
    if (!t.final_date || pct >= 100) return;
    const d = new Date(t.final_date); d.setHours(0, 0, 0, 0);
    if (Number.isNaN(d.getTime())) return;
    if (d < today) overdue++;
    else if (d <= in7Days) dueSoon++;
  });
  return {
    total: tasks.length,
    overdue,
    dueSoon,
    orphan,
    avgPercent: percentCount ? Math.round(percentSum / percentCount) : 0,
  };
}

export default function GtppMain(props: GtppMainProps) {
  const { setTask, setTaskPercent, isAdm } = useWebSocket();

  // Filtro de prazo é recurso de auditoria: só vive enquanto o admin está ligado.
  // Ao desligar, limpa para o board não exibir resultados parciais sem o controle visível.
  useEffect(() => {
    if (!isAdm && (props.dateFrom || props.dateTo)) {
      props.setDateFrom("");
      props.setDateTo("");
    }
  }, [isAdm]);

  const openNavbar = React.useCallback(() => {
    const toggle = document.querySelector<HTMLButtonElement>('[data-tour="navbar-toggle"]');
    const collapse = document.querySelector('#basic-navbar-nav');
    const isOpen = collapse?.classList.contains('show');
    if (toggle && !isOpen) toggle.click();
  }, []);

  const closeTaskModal = React.useCallback(() => {
    props.setOpenCardDefault(false);
  }, [props]);

  const openFirstTask = React.useCallback(() => {
    const first = props.getTask?.[0];
    if (!first) return;
    setTask(first);
    setTaskPercent(Number(first.percent ?? 0));
    props.setOpenCardDefault(true);
  }, [props, setTask, setTaskPercent]);

  /**
   * Para o tour cobrir o painel de comentários, precisamos:
   * 1) Abrir a primeira tarefa (que carrega taskDetails com os items)
   * 2) Esperar o item-comentário aparecer no DOM
   * 3) Disparar click no ícone que abre o SocialCommentFeed
   * Tudo dentro de setTimeouts encadeados — o measure() do ProductTour
   * já tem retries internos para acomodar elementos que ainda não pintaram.
   */
  const openFirstTaskComments = React.useCallback(() => {
    openFirstTask();
    setTimeout(() => {
      const btn = document.querySelector<HTMLElement>('[data-tour="gtpp-comments-trigger"]');
      if (btn) btn.click();
    }, 400);
  }, [openFirstTask]);

  const tourSteps = useMemo(
    () => buildGtppTourSteps({ openNavbar, openFirstTask, openFirstTaskComments, closeTaskModal }),
    [openNavbar, openFirstTask, openFirstTaskComments, closeTaskModal]
  );

  useRegisterTourSteps(tourSteps, [tourSteps]);

  function AdminKpiPanel() {
    if (!isAdm) return null;
    const k = useMemo(() => computeAdminKpis(props.getTask), [props.getTask]);
    const cards: Array<{ label: string; value: string | number; color: string; icon: string }> = [
      { label: "Total", value: k.total, color: "secondary", icon: "fa-list" },
      { label: "Atrasadas", value: k.overdue, color: "danger", icon: "fa-triangle-exclamation" },
      { label: "Vencem em 7d", value: k.dueSoon, color: "warning", icon: "fa-clock" },
      { label: "Sem responsável", value: k.orphan, color: "info", icon: "fa-user-slash" },
      { label: "% média", value: `${k.avgPercent}%`, color: "success", icon: "fa-percent" },
    ];
    return (
      <div className="w-100 d-flex gap-2 flex-wrap mt-2" data-tour="gtpp-admin-kpis">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`d-flex align-items-center gap-2 px-3 py-2 border rounded bg-light border-${c.color}`}
            style={{ minWidth: "140px" }}
          >
            <i className={`fa-solid ${c.icon} text-${c.color}`}></i>
            <div className="d-flex flex-column">
              <span className="fw-bold" style={{ lineHeight: 1, fontSize: "1.15rem" }}>{c.value}</span>
              <small className="text-muted" style={{ fontSize: "0.7rem" }}>{c.label}</small>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function HeaderFilters() {
    const hasDateFilter = !!(props.dateFrom || props.dateTo);
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
          {isAdm && (
          <div data-tour="gtpp-date-range">
            <label className="form-label mb-1">Prazo entre:</label>
            <div className="d-flex align-items-center gap-2">
              <input
                type="date"
                className="form-control"
                value={props.dateFrom}
                max={props.dateTo || undefined}
                onChange={(e) => props.setDateFrom(e.target.value)}
                aria-label="Data inicial do prazo"
              />
              <span>—</span>
              <input
                type="date"
                className="form-control"
                value={props.dateTo}
                min={props.dateFrom || undefined}
                onChange={(e) => props.setDateTo(e.target.value)}
                aria-label="Data final do prazo"
              />
              {hasDateFilter && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  title="Limpar filtro de prazo"
                  onClick={() => { props.setDateFrom(""); props.setDateTo(""); }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>
            <div className="d-flex gap-1 mt-2 flex-wrap" data-tour="gtpp-date-presets">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => { const r = buildPeriodPreset("week"); props.setDateFrom(r.from); props.setDateTo(r.to); }}
              >
                Esta semana
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => { const r = buildPeriodPreset("month"); props.setDateFrom(r.from); props.setDateTo(r.to); }}
              >
                Este mês
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => { const r = buildPeriodPreset("overdue"); props.setDateFrom(r.from); props.setDateTo(r.to); }}
              >
                Vencidas
              </button>
            </div>
          </div>
          )}
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
    // Recorta a lista pelo intervalo de prazo (final_date) quando algum extremo está preenchido.
    // Tarefas sem final_date ficam ocultas durante a vigência do filtro — auditoria pede um prazo definido.
    const fromTs = props.dateFrom ? new Date(props.dateFrom + "T00:00:00").getTime() : null;
    const toTs = props.dateTo ? new Date(props.dateTo + "T23:59:59").getTime() : null;
    const tasksInRange = (fromTs === null && toTs === null)
      ? props.getTask
      : props.getTask.filter((t) => {
          if (!t.final_date) return false;
          const ts = new Date(t.final_date).getTime();
          if (Number.isNaN(ts)) return false;
          if (fromTs !== null && ts < fromTs) return false;
          if (toTs !== null && ts > toTs) return false;
          return true;
        });
    return (
      <Col xs={12} data-tour="gtpp-board" className="d-flex flex-nowrap p-0 menu-expansivo flex-grow-1" style={{ overflowX: "auto", height: "70%" }}>
        {props.states?.map((state: any, idx) => {
          const filteredTasks = tasksInRange.filter((t) => t.state_id === state.id);
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
          <AdminKpiPanel />
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