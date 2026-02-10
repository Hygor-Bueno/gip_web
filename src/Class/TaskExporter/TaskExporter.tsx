import React from "react";
import { Task } from "./types";
import { TaskTable } from "./TaskTable";
import { useTaskExport } from "./useTaskExport";
import { taskColumns } from "./taskColumn";

interface TaskExporterProps {
  data: Task[];
}

const TaskExporter: React.FC<TaskExporterProps> = ({ data }) => {
  const tasks = data.filter((t) => t.state_id);
  const { loading, exportPDF, exportCSV } = useTaskExport(tasks, taskColumns);
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <h2 style={{ textAlign: "center" }}>Pré-visualização do Relatório</h2>
      <p style={{ textAlign: "center" }}>{tasks.length} tarefa(s) com estado definido</p>
      <TaskTable data={tasks} columns={taskColumns} />
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button
          className="" 
          onClick={exportPDF} 
          disabled={loading === "pdf" || !tasks.length} 
          style={{
              margin: '0 10px',
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              borderRadius: '10px',
              cursor: tasks.length === 0 ? 'not-allowed' : 'pointer',
              background: tasks.length === 0 ? '#ccc' : '#28a745',
              color: 'white',
              minWidth: '160px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 8px rgba(40,167,69,0.3)',
        }}>
          {loading === "pdf" ? "Gerando PDF..." : "Gerar PDF"}
        </button>
      </div>
    </div>
  );
};

export default TaskExporter;
