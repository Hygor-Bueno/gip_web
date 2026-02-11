import React from "react";
import { Card, Badge } from "react-bootstrap";
import "./Kanban.style.css";
import { useConnection } from "../../../Context/ConnContext";
type Priority = "low" | "medium" | "high";

interface Task {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    progress: number;
    priority: Priority;
}

interface Column {
    id: string;
    title: string;
    tasks: Task[];
}

interface Props {
    columns?: Column[];
}

const priorityVariant: Record<Priority, string> = {
    low: "secondary",
    medium: "warning",
    high: "danger",
};

const kanbanMock : Column[] = [
  {
    id: "todo",
    title: "A Fazer",
    tasks: [
      {
        id: 5178,
        title: "Bugs GTPP",
        startDate: "06/02/2026",
        endDate: "14/02/2026",
        progress: 29,
        priority: "medium",
      },
      {
        id: 5180,
        title: "Ajustar layout dashboard",
        startDate: "08/02/2026",
        endDate: "16/02/2026",
        progress: 10,
        priority: "low",
      },
    ],
  },
  {
    id: "doing",
    title: "Fazendo",
    tasks: [
      {
        id: 4566,
        title: "Módulo EPP",
        startDate: "04/06/2025",
        endDate: "10/02/2026",
        progress: 74,
        priority: "high",
      },
    ],
  },
  {
    id: "review",
    title: "Validar",
    tasks: [
      {
        id: 5201,
        title: "Integração API",
        startDate: "01/02/2026",
        endDate: "11/02/2026",
        progress: 90,
        priority: "medium",
      },
    ],
  },
  {
    id: "done",
    title: "Feito",
    tasks: [
      {
        id: 5115,
        title: "Correção relatórios",
        startDate: "27/01/2026",
        endDate: "27/01/2026",
        progress: 100,
        priority: "low",
      },
    ],
  },
];


const KanbanBoard: React.FC<Props> = () => {
    const {fetchData} =useConnection();
    const [ columns, setColumns ] = React.useState<Column[]>(kanbanMock);
    

    /**
     * Recupera os estados das tarefas do armazenamento local ou via API.
     * Armazena os estados no `localStorage` para acesso rápido.
     * @function
     * @async
     */
    // async function getStateformations() {
    //     let listState: iStates[] = [] as iStates[];
    //     try {
    //         if (localStorage.gtppStates) {
    //             listState = JSON.parse(localStorage.gtppStates);
    //         } else {
    //             const getStatusTask: { error: boolean, message?: string, data?: [{ id: number, description: string, color: string }] } =
    //                 await fetchData({ method: "GET", pathFile: "GTPP/TaskState.php", params: null, exception: ["no data"], urlComplement: "" });
    //             if (getStatusTask.error) throw new Error(getStatusTask.message || 'Erro ao obter estados');
                
    //         }
    //     } catch (error) {
    //         console.error(`Erro ao obter estados das tarefas: ${error}`);
    //     }
    // }
    return (
        <div className="kanban-wrapper d-flex gap-3 overflow-auto">
            {columns.map((column) => (
                <div key={column.id} className="kanban-column">
                    <div className="kanban-column-header">
                        <span>{column.title}</span>
                        <Badge bg="light" text="dark">
                            {column.tasks.length}
                        </Badge>
                    </div>

                    <div className="kanban-tasks">
                        {column.tasks.map((task) => (
                            <Card key={task.id} className="kanban-card shadow-sm">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="kanban-card-title">
                                            #{task.id} {task.title}
                                        </div>
                                        <Badge bg={priorityVariant[task.priority]}>
                                            {task.priority}
                                        </Badge>
                                    </div>

                                    <div className="kanban-dates">
                                        <small>
                                            Início: {task.startDate}
                                            <br />
                                            Fim: {task.endDate}
                                        </small>
                                    </div>

                                    <div className="kanban-progress mt-2">
                                        <div className="progress" style={{ height: 6 }}>
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{ width: `${task.progress}%` }}
                                            />
                                        </div>
                                        <small className="text-muted">
                                            {task.progress}% concluído
                                        </small>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanBoard;
