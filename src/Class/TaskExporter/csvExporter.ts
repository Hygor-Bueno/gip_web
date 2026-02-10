import { Column, Task } from "./types";

export const exportTasksToCSV = (
  tasks: Task[],
  columns: Column<Task>[],
  baseFilename: string
) => {
  if (!tasks.length) {
    alert("Nenhuma tarefa para exportar.");
    return;
  }

  const headers = columns.map((c) => c.label);

  const rows = tasks.map((task) =>
    columns.map((col) => {
      const raw = task[col.key];
      const value = col.format ? col.format(raw, task) : String(raw ?? "");
      return `"${value.replace(/"/g, '""').replace(/\n/g, " ")}"`;
    })
  );

  const csvContent = [
    headers.map((h) => `"${h}"`).join(";"),
    ...rows.map((r) => r.join(";")),
  ].join("\r\n");

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "-");
  const filename = `${baseFilename}_${dateStr}_${timeStr}.csv`;

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {
    href: url,
    download: filename,
    style: { display: "none" },
  });

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
