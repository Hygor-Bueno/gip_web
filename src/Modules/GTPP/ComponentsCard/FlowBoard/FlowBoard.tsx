import React, { useEffect, useMemo } from "react";
import NavBar from "../../../../Components/NavBar";
import { listPath } from "../../mock/configurationfile";
import CardUser from "../../../CLPP/Components/CardUser";
import NotificationBell from "../../../../Components/NotificationBell";
import ModalDefault from "../Modal/Modal";
import { FilterPage } from "../Filter/FilterPage";
import { InputCheckButton } from "../../../../Components/CustomButton";
import GtppMainProps from "../../Interfaces/IGtppMainProps";
import "./FlowBoard.css";
import { useRegisterTourSteps } from "../../../../Context/TourContext";
import { useWebSocket } from "../../Context/GtppWsContext";
import { buildGtppTourSteps } from "../../Tour/gtppTourSteps";
import DrillPanel from "./DrillPanel";
import AdminKpiPanel from "./AdminKpiPanel";
import HeaderFilters from "./HeaderFilters";
import BoardColumns from "./BoardColumns";
import FloatingFilterPanel from "./FloatingFilterPanel";
import ModalThemeRegisterTask from "./ModalThemeRegisterTask";
import { useFilterPanelDrag } from "./useFilterPanelDrag";
import { useKpiDrilldown, drillMeta, tasksForKpi } from "./useKpiDrilldown";

export default function GtppMain(props: GtppMainProps) {
  const { setTask, setTaskPercent, isAdm } = useWebSocket();

  // Filtro de prazo é recurso de auditoria: só vive enquanto o admin está ligado.
  useEffect(() => {
    if (!isAdm && (props.dateFrom || props.dateTo)) {
      props.setDateFrom("");
      props.setDateTo("");
    }
  }, [isAdm]);

  const {
    filterPanelOpen, setFilterPanelOpen, panelPos, dragging, panelRef,
    onPanelMouseDown, onPanelTouchStart, openFilterPanel,
  } = useFilterPanelDrag();

  const { drillKpis, toggleDrill, userMap, loadingUsers } = useKpiDrilldown(isAdm);

  function openTaskFromDrill(t: any) {
    setTask(t);
    setTaskPercent(Number(t.percent ?? 0));
    props.setOpenCardDefault(true);
  }

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

  return (
    <div id="moduleGTPP" className="d-flex flex-row h-100 w-100 position-relative container-fluid m-0 p-0">
      {props.openThemeModal && <ModalThemeRegisterTask onClose={() => props.setOpenThemeModal(false)} />}
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
                <button data-tour="gtpp-menu-toggle" title={props.openMenu ? "Ocultar menu" : "Exibir menu"} onClick={() => props.setOpenMenu(!props.openMenu)} className="btn p-0 d-block d-md-none">
                  <i className={`fa-solid fa-eye${props.openMenu ? "-slash" : ""}`}></i>
                </button>
                <button data-tour="gtpp-sound" title={props.onSounds ? "Som ligado" : "Som desligado"} onClick={() => props.setOnSounds(!props.onSounds)} className="btn p-0">
                  <i className={`fa-solid fa-volume-${props.onSounds ? "high" : "xmark"}`}></i>
                </button>
                <button
                  type="button"
                  data-tour="gtpp-floating-filter-trigger"
                  title="Abrir filtros"
                  onClick={openFilterPanel}
                  className={`gtpp-floating-filter-fab${filterPanelOpen ? " gtpp-floating-filter-fab--active" : ""}`}
                  aria-label="Abrir filtros"
                  aria-expanded={filterPanelOpen}
                >
                  <i className="fa-solid fa-filter"></i>
                </button>
                <span data-tour="gtpp-bell"><NotificationBell /></span>
              </div>
            </div>
          </div>
          <AdminKpiPanel isAdm={isAdm} tasks={props.getTask} drillKpis={drillKpis} toggleDrill={toggleDrill} />
          <BoardColumns props={props} />
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
      {filterPanelOpen && panelPos && (
        <FloatingFilterPanel
          panelRef={panelRef}
          dragging={dragging}
          panelPos={panelPos}
          onClose={() => setFilterPanelOpen(false)}
          onPanelMouseDown={onPanelMouseDown}
          onPanelTouchStart={onPanelTouchStart}
        >
          <HeaderFilters props={props} isAdm={isAdm} />
        </FloatingFilterPanel>
      )}
      {drillKpis.map((kpi, idx) => (
        <DrillPanel
          key={kpi}
          kpiKey={kpi}
          title={drillMeta[kpi].title}
          icon={drillMeta[kpi].icon}
          alert={drillMeta[kpi].alert}
          tasks={tasksForKpi(kpi, props.getTask)}
          initialOffset={idx}
          userMap={userMap}
          loadingUsers={loadingUsers}
          onClose={() => toggleDrill(kpi)}
          onOpenTask={openTaskFromDrill}
        />
      ))}
    </div>
  );
}
