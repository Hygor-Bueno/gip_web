import { Column, Task } from "./types";
import { sanitize } from "./formatters";
import { styleStringFunction } from "../../stylecss/style";

export const exportTasksToPDF = (
  tasks: Task[],
  columns: Column<Task>[]
) => {
  if (!tasks.length) {
    alert("Nenhuma tarefa para gerar PDF.");
    return;
  }

  const printWin = window.open("", "_blank", "width=1200,height=900");
  if (!printWin) {
    alert("Permita pop-ups para gerar o PDF.");
    return;
  }

  const today = new Date().toLocaleDateString("pt-BR");
  const now = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const tableHTML = `
    <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:15px;">
      <thead>
        <tr style="background:#f8f9fa;">
          ${columns
            .map(
              (c) =>
                `<th style="border:1px solid #ddd; padding:10px; text-align:left;">${c.label}</th>`
            )
            .join("")}
        </tr>
      </thead>
      <tbody>
        ${tasks
          .map(
            (task) => `
          <tr>
            ${columns
              .map((col) => {
                const raw = task[col.key];
                const value = col.format
                  ? col.format(raw, task)
                  : String(raw ?? "");
                return `<td style="border:1px solid #ddd; padding:8px;">${sanitize(
                  value
                )}</td>`;
              })
              .join("")}
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;

  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>GTPP - Relatório de Tarefas</title>
      <style>
        ${styleStringFunction()}
      </style>
    </head>
    <body>
      <h1>Relatório de Tarefas</h1>
      <p>Total: ${tasks.length} tarefa(s) — ${today} às ${now}</p>
      ${tableHTML}
    </body>
    </html>
  `);

  printWin.document.close();
  printWin.focus();
  setTimeout(() => printWin.print(), 500);
};
