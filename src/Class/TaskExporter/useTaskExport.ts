import { useState, useCallback } from "react";
import { Task, Column } from "./types";
import { exportTasksToCSV } from "./csvExporter";
import { exportTasksToPDF } from "./pdfExporter";

export function useTaskExport(tasks: Task[], columns: Column<Task>[]) {
  const [loading, setLoading] = useState<"pdf" | "csv" | null>(null);

  const exportPDF = useCallback(() => {
    setLoading("pdf");
    setTimeout(() => {
      exportTasksToPDF(tasks, columns);
      setLoading(null);
    }, 300);
  }, [tasks, columns]);

  const exportCSV = useCallback(() => {
    setLoading("csv");
    setTimeout(() => {
      exportTasksToCSV(tasks, columns, "GTPP-documento");
      setLoading(null);
    }, 300);
  }, [tasks, columns]);

  return { loading, exportPDF, exportCSV };
}
