import React, { useState, useEffect } from "react";
import { useMyContext } from "../../Context/MainContext";
import "./Gtpp.css";
import { Col } from "react-bootstrap";
import NavBar from "../../Components/NavBar";
import { listPath } from "./mock/configurationfile";
import ColumnTaskState from "./ComponentsCard/ColumnTask/columnTask";
import PDFGenerator, { generateAndDownloadCSV } from "../../Class/FileGenerator";
import Cardregister from "./ComponentsCard/CardRegister/Cardregister";
import ModalDefault from "./ComponentsCard/Modal/Modal";
import { useWebSocket } from "./Context/GtppWsContext";
import NotificationBell from "../../Components/NotificationBell";
import { iPropsInputCheckButton } from "../../Interface/iGTPP";
import CardUser from "../CLPP/Components/CardUser";
import { InputCheckButton } from "../../Components/CustomButton";
import { tItemTable } from "../../types/types";
import CustomTable from "../../Components/CustomTable";
import { useConnection } from "../../Context/ConnContext";
import { maskUserSeach } from "../../Util/Util";
import FiltersSearchUser from "../../Components/FiltersSearchUser";
import ModalTheme from "./ComponentsCard/Theme/Theme";

export default function Gtpp(): JSX.Element {
  const { setTitleHead, setModalPage, setModalPageElement, userLog, setLoading } = useMyContext();
  const { clearGtppWsContext, setOnSounds, updateStates, setOpenCardDefault, loadTasks, reqTasks, openCardDefault, taskDetails, states, onSounds, task, getTask, setIsAdm } = useWebSocket();
  const [openFilter, setOpenFilter] = useState<any>(false);
  const [openFilterGolbal, setOpenFilterGolbal] = useState<any>(false);
  const [openMenu, setOpenMenu] = useState<any>(true);
  const [isHeader, setIsHeader] = useState<boolean>(false);
  const [isTheme, seIsTheme] = useState<boolean>(false);
  const [checkTheme, setCheckTheme] = useState<boolean>(false);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);

  const listButtonInputs: iPropsInputCheckButton[] = [
    {inputId: `check_adm_${userLog.id}`, nameButton: "Elevar como administrador", onAction: async (event: boolean) => { setIsAdm(event); }, labelIcon: "fa-solid fa-user-tie", highlight: true},
    {inputId: `gttp_exp_ret`, nameButton: "Exibir usuários", onAction: () => setIsHeader(!isHeader), labelIconConditional: ["fa-solid fa-chevron-up", "fa-solid fa-chevron-down"], highlight: false },
    {inputId: `check_category`, nameButton: "Filtros da página", onAction: async (event: boolean) => { setCheckTheme((x:boolean)=>!x) }, labelIcon: "fa-solid fa-table-cells-large", highlight: true },
    {inputId: `check_filter`, nameButton: "Filtros da página", onAction: async (event: boolean) => { setOpenFilterGolbal(event) }, labelIcon: "fa-solid fa-filter", highlight: true},
    {inputId: `reload_tasks`, nameButton: "Recarregar as tarefas", onAction: async (event: boolean) => { await reqTasks(); }, labelIcon: "fa fa-refresh"},
    {inputId: `plust_theme`, nameButton: "Adiciona um novo tema", onAction: async (event: boolean) => { seIsTheme(true); }, labelIcon: "fa fa-plus"}
  ];
  // Modified by Hygor
  useEffect(() => {
    setTitleHead({
      title: "Gerenciador de Tarefas Peg Pese - GTPP",
      simpleTitle: "Gerenciador de Tarefas",
      icon: "fa fa-home",
    });
  }, [setTitleHead]);

  function handleCheckboxChange(stateId: number) {
    const newItem: any = [...states];
    newItem[newItem.findIndex((item: any) => item.id == stateId)].active = !newItem[newItem.findIndex((item: any) => item.id == stateId)].active;
    updateStates(newItem);
  };

  const handleOpenFilter = (e: any) => {
    setOpenFilter((prevOpen: any) => !prevOpen);
  };

  return (
    <div
      id="moduleGTPP"
      className="d-flex flex-row h-100 w-100 position-relative container-fluid m-0 p-0"
    >
      {openMenu && <NavBar list={listPath} />}
      {openFilterGolbal && <FilterPage />}
      {isTheme && 
        <ModalTheme
          selectedTasks={selectedTasks}
          title="Cadastre o Tema" 
          btnClose={(e:any) => seIsTheme(false)} 
          btnSave={(e:any) => {
            seIsTheme(false)
          }} 
        />}

      <div className="h-100 d-flex overflow-hidden px-3 flex-grow-1">
        <div className="flex-grow-1 d-flex flex-column justify-content-between align-items-start h-100 overflow-hidden">
          <div className="d-flex flex-column justify-content-between w-100">
            <div className="flex-grow-1 me-2 w-100">
              {isHeader ? <CardUser {...userLog} name={userLog.name} /> : <React.Fragment />}
            </div>
            <div className="d-flex flex-row mt-2 gap-2">
              {listButtonInputs.map((button, index) => <InputCheckButton key={`btn_header_gtpp_${index}`} {...button} />)}
            </div>
          </div>
          <div className="d-flex w-100 align-items-center justify-content-between my-2 py-2">
            <div className="position-relative">
              <h1 onClick={handleOpenFilter} className="cursor-pointer">
                Estados <i className="fa fa-angle-down"></i>
              </h1>
              <div className="position-absolute filter-modal">
                {openFilter ? (
                  <div className="form-control">
                    {states?.map(
                      (cardTaskStateValue: any, idxValueState: any) => (
                        <div className="d-flex align-items-center" key={idxValueState}>
                          <input
                            id={`filter_state_${cardTaskStateValue.id}`}
                            className="form-check-input"
                            type="checkbox"
                            onChange={() =>
                              handleCheckboxChange(cardTaskStateValue.id)
                            }
                            checked={cardTaskStateValue.active}
                          />
                          <label htmlFor={`filter_state_${cardTaskStateValue.id}`} className="form-check-label mx-2">
                            {cardTaskStateValue.description}
                          </label>
                        </div>
                      )
                    )}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="d-flex flex-row w-50 justify-content-end gap-2">
              <button title={openMenu ? "Ocultar menu" : "Exibir Menu"} onClick={() => setOpenMenu(!openMenu)} className={`btn p-0 d-block d-md-none`} >
                <i className={`fa-solid fa-eye${openMenu ? "-slash" : ''}`}></i>
              </button>
              <button
                className="btn p-0 mx-2 cursor-pointer"
                title={`${onSounds ? "Com audio" : "Sem audio"}`}
                onClick={() => {
                  setOnSounds(!onSounds);
                }}
              >
                <i className={`fa-solid fa-volume-${onSounds ? "high" : "xmark"}`}></i>
              </button>
              <button title="Exibir notificações" className="btn p-0">
                <NotificationBell />
              </button>
            </div>
          </div>
          <Col xs={12} className="d-flex flex-nowrap p-0 menu-expansivo flex-grow-1" style={{ overflowX: "auto", height: "70%" }}>
            {states?.map((cardTaskStateValue: any, idxValueState: any) => {
              const filteredTasks = getTask.filter((task: any) => task.state_id === cardTaskStateValue.id);
              const isFirstColumnTaskState = idxValueState === 0;

              return (
                cardTaskStateValue.active && (
                  <div key={idxValueState} className="column-task-container p-2 align-items-start flex-shrink-0">
                    <ColumnTaskState
                      selectedTasks={selectedTasks} 
                      setSelectedTasks={setSelectedTasks}
                      title={cardTaskStateValue.description}
                      isTheme={checkTheme}
                      bg_color={cardTaskStateValue.color}
                      is_first_column={isFirstColumnTaskState}
                      addTask={() => {
                        setModalPageElement(
                          <Cardregister
                            reloadtask={loadTasks}
                            assistenceFunction={() => setModalPage(false)}
                            onClose={() => setModalPage(false)}
                          />
                        );
                        setModalPage(true);
                      }}
                      exportCsv={() => {
                        generateAndDownloadCSV(filteredTasks, "GTPP-documento");
                      }}
                      exportPdf={() => {
                        setModalPageElement(
                          <div className="card w-75 position relative">
                            <div className="d-flex justify-content-end align-items-center">
                              <div className="">
                                <button
                                  className="btn fa fa-close m-4"
                                  onClick={() => setModalPage(false)}
                                ></button>
                              </div>
                            </div>
                            <div className="overflow-auto h-75">
                              <div className="m-3">
                                <PDFGenerator data={filteredTasks} />
                              </div>
                            </div>
                          </div>
                        );
                        setModalPage(true);
                      }}
                      content_body={filteredTasks}
                    />
                  </div>
                )
              );
            })}
          </Col>
        </div>
        {openCardDefault && (
          <ModalDefault
            taskFilter={task}
            details={taskDetails}
            close_modal={() => {
              setOpenCardDefault(false);
              clearGtppWsContext();
            }}
          />
        )}
      </div>
    </div>
  );
}


function FilterPage() {
  const [page, setPage] = useState<number>(1);
  const [limitPage, setLimitPage] = useState<number>(1);
  const [params, setParams] = useState<string>('');
  const [list, setList] = useState<tItemTable[]>([]);
  const { setLoading, appIdSearchUser } = useMyContext();

  const { fetchData } = useConnection();
  const { getTask, setGetTask, reqTasks, isAdm } = useWebSocket();

  useEffect(() => {
    (async () => {
      await recoverList(params);
      await reqTasks();
    })();
  }, [page, params, appIdSearchUser]);

  async function recoverList(value?: string) {
    try {
      setLoading(true);
      let newUrlComplement = `&pPage=${page}`;
      if (value) newUrlComplement += value;
      if (appIdSearchUser) newUrlComplement += `&pApplicationAccess=${appIdSearchUser}`;
      const req: any = await fetchData({ method: 'GET', params: null, pathFile: 'CCPP/Employee.php', urlComplement: newUrlComplement });
      if (req["error"]) throw new Error(req["message"]);
      setList(maskFilter(req["data"]));
      setLimitPage(req["limitPage"]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false)
    }
  }

  function maskFilter(array: any[]): tItemTable[] {
    return array.map(element => ({
      employee_id: maskUserSeach(element["employee_id"], "", false, true),
      employee_photo: maskUserSeach(element["employee_photo"], "#", true),
      employee_name: maskUserSeach(element["employee_name"], "Nome", false, false, "150px"),
      store_name: maskUserSeach(element["store_name"], "Loja", false, false, "150px"),
      departament_name: maskUserSeach(element["departament_name"], "Depto", false, false, "150px"),
    }));
  }

return (
  <div style={{ zIndex: "2" }} className="d-flex justify-content-end bg-dark bg-opacity-50 position-absolute top-0 start-0 w-100 h-100">
    <div className="bg-white col-12 col-sm-8 col-md-6 col-lg-5 d-flex flex-column h-100">
      <div className="d-flex justify-content-end p-2"><button onClick={async () => document.getElementById('check_filter')?.click()} type="button" className="btn btn-danger">X</button></div>
      <div className="px-2">
        <FiltersSearchUser
          onAction={(e: string) => {
            setParams(e);
            setPage(1);
          }}
          callBack={true}
        />
      </div>
      <div className="d-flex flex-column flex-grow-1 p-2 overflow-auto">
        {list.length > 0 && (
          <CustomTable
            list={list}
            onConfirmList={closeCustomTable}
          />
        )}
      </div>
      <footer className="d-flex align-items-center justify-content-around py-2">
        <button onClick={() => navPage(false)} className="btn btn-light fa-solid fa-backward" type="button"></button>
        {`( ${page.toString().padStart(2, '0')} / ${limitPage.toString().padStart(2, '0')} )`}
        <button onClick={() => navPage(true)} className="btn btn-light fa-solid fa-forward" type="button"></button>
      </footer>

    </div>
  </div>
);

  function closeCustomTable(colabs: any) {
    setGetTask(filterTasks(getTask, { ...parseQueryStringToJson(params), colabs: colabs.map((colab: any) => colab.employee_id.value) }));
    document.getElementById('check_filter')?.click();
  }

  function filterTasks(tasks: any[], filter: any): any[] {
    return tasks.filter(task => {
      const hasMatchingCSD = task.csds.some((csd: any) =>
        csd.company_id === Number(filter.pCompanyId) ||
        csd.shop_id === Number(filter.pShopId) ||
        csd.depart_id === Number(filter.pDepartmentId)
      );
      const colabMatch = task.colabs.some((colab: any) => filter.colabs.includes(colab.user_id));
      const isUserOwnerMatch = filter.colabs.includes(String(task.user_id));
      return hasMatchingCSD || (colabMatch || isUserOwnerMatch);
    });
  }

  function navPage(isNext: boolean) {
    if (limitPage === 0) return;
    const newPage = isNext ? page + 1 : page - 1;
    if (newPage <= limitPage && newPage >= 1) {
      setPage(newPage);
    }
  }
  function parseQueryStringToJson(queryString: string): Record<string, string> {
    if (queryString.startsWith('&')) {
      queryString = queryString.slice(1);
    }

    const pairs = queryString.split('&');
    const result: Record<string, string> = {};

    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      result[key] = value;
    }
    return result;
  }
}