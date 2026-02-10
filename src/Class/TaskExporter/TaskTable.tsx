import React from "react";
import { Column } from "./types";

interface Props<T> {
  data: T[];
  columns: Column<T>[];
}

export function TaskTable<T extends object>({ data, columns }: Props<T>) {
  return (
    <table
      style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}
      className="table table-striped table-bordered"
    >
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={String(c.key)} style={{ padding: 12, border: "1px solid #ddd" }}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((c) => {
              const raw = row[c.key];
              const value = c.format ? c.format(raw, row) : String(raw ?? "");
              return (
                <td key={String(c.key)} style={{ padding: 10, border: "1px solid #ddd" }}>
                  {value}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
