import React from "react";
import { Col } from "react-bootstrap";
import NavBar from "../../Components/NavBar";
import { listPath } from "./mock/configurationfile";
import ColumnTaskState from "./ComponentsCard/ColumnTask/columnTask";
import CardUser from "../CLPP/Components/CardUser";
import NotificationBell from "../../Components/NotificationBell";
import Cardregister from "./ComponentsCard/CardRegister/Cardregister";
import ModalDefault from "./ComponentsCard/Modal/Modal";
import PDFGenerator, { generateAndDownloadCSV } from "../../Class/FileGenerator";
import { FilterPage } from "./ComponentsCard/Filter/FilterPage";
import { InputCheckButton } from "../../Components/CustomButton";
import GtppMainProps from "./Interfaces/IGtppMainProps";

export default function GtppMain(props: GtppMainProps) {
  function HeaderFilters() {
    return (
      <div className="d-flex w-100 align-items-center justify-content-start gap-5 mt-3">
        <div className="d-flex gap-4 mb-3 flex-wrap">
          <div>
            <label className="form-label mb-1">Filtrar pelo tema:</label>
            <select
              className="form-select"
              value={props.selectedThemeIds}
              onChange={(e) => props.setSelectedThemeIds(e.target.value)}
            >
              <option value="" hidden>
                Selecione
              </option>
              {props.themeList?.map((theme) => (
                <option key={theme.id_theme} value={theme.id_theme}>
                  {theme.description_theme}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="position-relative">
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
      <Col xs={12} className="d-flex flex-nowrap p-0 menu-expansivo flex-grow-1" style={{ overflowX: "auto", height: "70%" }}>
        {props.states?.map((state: any, idx: any) => {
          const filteredTasks = props.getTask.filter((t: any) => t.state_id === state.id);
          const isFirstColumn = idx === 0;
          return (
            state.active && (
              <div key={state.id} className="column-task-container p-2 flex-shrink-0">
                <ColumnTaskState
                  theme_id_fk={props.selectedThemeIds}
                  selectedTasks={props.selectedTasks}
                  setSelectedTasks={props.setSelectedTasks}
                  title={state.description}
                  bg_color={state.color}
                  isTheme={true}
                  is_first_column={isFirstColumn}
                  addTask={() => {
                    props.setModalPageElement(<Cardregister reloadtask={props.loadTasks} assistenceFunction={() => props.setModalPage(false)} onClose={() => props.setModalPage(false)} />);
                    props.setModalPage(true);
                  }}
                  exportCsv={() => generateAndDownloadCSV(filteredTasks, "GTPP-documento")}
                  exportPdf={() => {
                    props.setModalPageElement(
                      <div className="card w-75 position-relative bg-white">
                        <div className="d-flex justify-content-end p-3">
                          <button className="btn-close" onClick={() => props.setModalPage(false)}></button>
                        </div>
                        <div className="overflow-auto p-4" style={{ maxHeight: "80vh" }}>
                          <PDFGenerator data={filteredTasks} />
                        </div>
                      </div>
                    );
                    props.setModalPage(true);
                  }}
                  content_body={filteredTasks}
                />
              </div>
            )
          );
        })}
      </Col>
    )
  }

  return (
    <div id="moduleGTPP" className="d-flex flex-row h-100 w-100 position-relative container-fluid m-0 p-0">
      {props.openMenu && <NavBar list={listPath} />}
      {props.openFilterGolbal && <FilterPage />}
      <div className="h-100 d-flex overflow-hidden px-3 flex-grow-1">
        <div className="flex-grow-1 d-flex flex-column justify-content-between align-items-start h-100 overflow-hidden">
          <div className="d-flex flex-column justify-content-between w-100">
            <div className="flex-grow-1 me-2 w-100">{props.isHeader ? <CardUser {...props.userLog} name={props.userLog.name} /> : null}</div>
            <div className="d-flex justify-content-between">
              <div className="d-flex flex-row mt-2 gap-2 flex-wrap">
                {props.listButtonInputs.map((btn: any, idx: number) => (<InputCheckButton key={`btn_header_gtpp_${idx}`} {...btn} />))}
              </div>
              <div className="d-flex gap-3 align-items-center">
                <React.Fragment>
                  <button title={props.openMenu ? "Ocultar menu" : "Exibir menu"} onClick={() => props.setOpenMenu(!props.openMenu)} className="btn p-0 d-block d-md-none">
                    <i className={`fa-solid fa-eye${props.openMenu ? "-slash" : ""}`}></i>
                  </button>
                  <button title={props.onSounds ? "Som ligado" : "Som desligado"} onClick={() => props.setOnSounds(!props.onSounds)} className="btn p-0">
                    <i className={`fa-solid fa-volume-${props.onSounds ? "high" : "xmark"}`}></i>
                  </button>
                </React.Fragment>
                <NotificationBell />
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