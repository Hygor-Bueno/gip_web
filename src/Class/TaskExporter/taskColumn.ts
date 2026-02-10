import { Column, Task } from "./types";
import { formatDateBR, getPriorityText } from "./formatters";

export const taskColumns: Column<Task>[] = [
  { key: "description", label: "Tarefa" },
  { key: "state_description", label: "Estado" },
  {
    key: "priority",
    label: "Prioridade",
    format: (v) => getPriorityText(v as number),
  },
  {
    key: "initial_date",
    label: "Início",
    format: (v) => formatDateBR(String(v)),
  },
  {
    key: "final_date",
    label: "Fim",
    format: (v) => formatDateBR(String(v)),
  },
  {
    key: "percent",
    label: "Progresso",
    format: (v) => (v !== undefined ? `${v}%` : "—"),
  },
];
