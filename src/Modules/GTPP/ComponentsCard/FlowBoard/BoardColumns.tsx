import React from "react";
import { Col } from "react-bootstrap";
import ColumnTaskState from "../ColumnTask/columnTask";
import Cardregister from "../CardRegister/Cardregister";
import PDFGenerator from "../../../../Class/TaskExporter/TaskExporter";
import { generateAndDownloadCSV, Task } from "../../../../Class/FileGenerator";
import GtppMainProps from "../../Interfaces/IGtppMainProps";

interface Props {
  props: GtppMainProps;
}

export default function BoardColumns({ props }: Props) {
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
          )
        );
      })}
    </Col>
  );
}
