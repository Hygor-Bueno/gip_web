import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { tItemTable } from "../types/types";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { convertDate, convertTime } from "../Util/Utils";

const defaultImage = require('../Assets/Image/groupCLPP.png');

interface CustomTableProps {
  list: tItemTable[];
  onConfirmList: (selected: tItemTable[]) => void;
  selectedItems?: tItemTable[];
  maxSelection?: number;
  selectionList?: tItemTable[];
  selectionKey?: string;
  hiddenButton?: boolean;
  onRowClick?: any;
}

export default function CustomTable(props: CustomTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<tItemTable[]>(props.selectedItems || []);

  function isValidDateString(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  const isRowSelected = (row: tItemTable): boolean => {
    if (!props.selectionList || !props.selectionKey || !row[props.selectionKey]) return false;
    return props.selectionList.some(item => {
      if (!item[props.selectionKey!]) return false;
      return item[props.selectionKey!].value === row[props.selectionKey!].value;
    });
  };

  const tableRef = useRef<HTMLTableElement>(null);

  function handleDownloadPDF() {
    if (tableRef.current) {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [297, 210] });
      const headers: string[] = [];
      const rows: string[][] = [];
      tableRef.current.querySelectorAll('thead th').forEach((cell) => headers.push(cell.textContent || ''));
      tableRef.current.querySelectorAll('tbody tr').forEach((row) => {
        const rowData: string[] = [];
        row.querySelectorAll('td').forEach((cell) => rowData.push(cell.textContent || ''));
        rows.push(rowData);
      });
      autoTable(doc, {
        head: [headers], body: rows,
        margin: { top: 10, left: 5, right: 5, bottom: 10 },
        styles: { fontSize: 10, cellPadding: 3 },
      });
      doc.save('tabela.pdf');
    }
  }

  useEffect(() => {
    if (props.selectionList && props.selectionKey) {
      const itemsToSelect = props.list.filter(row => isRowSelected(row));
      setSelectedRows((prev) => {
        const newItems = itemsToSelect.filter(item => !prev.includes(item));
        return [...prev, ...newItems];
      });
    }
  }, [props.selectionList, props.selectionKey, props.list]);

  useEffect(() => {
    if (props.selectedItems) setSelectedRows(props.selectedItems);
  }, [props.selectedItems]);

  const columnKeys = Object.keys(props.list[0]);
  const columnHeaders = columnKeys.reduce((acc, key) => {
    acc[key] = props.list[0][key].tag;
    return acc;
  }, {} as { [key: string]: string });

  const sortedItemTable = [...props.list].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const rawA = a[key]?.value ?? "";
    const rawB = b[key]?.value ?? "";
    const valueA = isNaN(Number(rawA)) ? rawA.toLowerCase() : Number(rawA);
    const valueB = isNaN(Number(rawB)) ? rawB.toLowerCase() : Number(rawB);
    if (valueA < valueB) return direction === "asc" ? -1 : 1;
    if (valueA > valueB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredItemsTable = sortedItemTable.filter((item) =>
    Object.keys(filters).every((key) =>
      item[key]?.value?.toLowerCase().includes(filters[key].toLowerCase())
    )
  );

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      return { key, direction: "asc" };
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleRowSelection = (item: tItemTable) => {
    setSelectedRows((prev) => {
      if (prev.includes(item)) return prev.filter((row) => row !== item);
      if (props.maxSelection && prev.length >= props.maxSelection) return prev;
      return [...prev, item];
    });
  };

  const RenderCell = (props: { value: string; isImage?: boolean }) => {
    return props.isImage ? (
      <img className="ct-photo-circle" src={props.value ? `data:image/png;base64,${props.value}` : defaultImage} />
    ) : (
      <span>{isValidDateString(props.value) ? convertDate(props.value, true) : props.value}</span>
    );
  };

  function setSelectedAllRows() {
    setSelectedRows([...props.list]);
  }

  return (
    <>
      <style>{`
        .ct-card {
          background: #fff;
          border: 1px solid #e8eaf0;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        /* Table wrapper */
        .ct-table-wrapper {
          overflow: auto;
          flex: 1;
          isolation: isolate;
        }

        .ct-table-wrapper::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .ct-table-wrapper::-webkit-scrollbar-track { background: #f1f5f9; }
        .ct-table-wrapper::-webkit-scrollbar-thumb { background: #bed989; border-radius: 10px; }

        /* Table */
        .ct-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }

        .ct-table thead tr {
          background: #f8fafc;
        }

        .ct-table thead th {
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e8eaf0;
          white-space: nowrap;
          border-right: 1px solid #f1f5f9;
          position: sticky;
          top: 0;
          z-index: 1;
          background: #f8fafc;
        }

        .ct-table thead th:last-child { border-right: none; }

        .ct-th-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .ct-th-label {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          user-select: none;
          transition: color 0.15s;
        }

        .ct-th-label:hover { color: #6a9e2f; }

        .ct-sort-icon {
          font-size: 9px;
          color: #bed989;
        }

        .ct-filter-btn {
          width: 26px;
          height: 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1.5px solid #e2e8f0;
          border-radius: 7px;
          color: #94a3b8;
          cursor: pointer;
          font-size: 11px;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          flex-shrink: 0;
        }

        .ct-filter-btn:hover, .ct-filter-btn.active {
          background: #f0f7e6;
          border-color: #bed989;
          color: #6a9e2f;
        }

        .ct-filter-input {
          padding: 5px 10px;
          font-size: 12.5px;
          border: 1.5px solid #bed989;
          border-radius: 8px;
          outline: none;
          background: #fff;
          color: #1a202c;
          box-shadow: 0 0 0 3px rgba(190,217,137,0.15);
          width: 100%;
        }

        /* Rows */
        .ct-table tbody tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.12s;
          cursor: pointer;
        }

        .ct-table tbody tr:last-child { border-bottom: none; }

        .ct-table tbody tr:hover { background: #f8fafc; }

        .ct-table tbody tr.ct-row-selected {
          background: #f0f7e6;
        }

        .ct-table tbody tr.ct-row-selected:hover {
          background: #e8f3d6;
        }

        .ct-table tbody td {
          padding: 11px 16px;
          color: #374151;
          vertical-align: middle;
          border-right: 1px solid #f1f5f9;
        }

        .ct-table tbody td:last-child { border-right: none; }

        .ct-photo-circle {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e2e8f0;
        }

        /* Footer */
        .ct-footer {
          padding: 16px 20px;
          border-top: 2px solid #f1f3f8;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          background: #fafafa;
          border-radius: 0 0 16px 16px;
        }

        .ct-footer-info {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 500;
          white-space: nowrap;
        }

        .ct-footer-info span {
          color: #6a9e2f;
          font-weight: 700;
        }

        .ct-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
          white-space: nowrap;
        }

        .ct-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.06);
        }

        .ct-btn:active { transform: translateY(0); }

        .ct-btn-primary {
          background: #bed989;
          color: #fff;
          box-shadow: 0 2px 8px rgba(190,217,137,0.35);
        }

        .ct-btn-secondary {
          background: #f1f5f9;
          color: #64748b;
          border: 1.5px solid #e2e8f0;
        }

        .ct-btn-secondary:hover { background: #e8eaf0; }

        .ct-btn-download {
          background: #1a202c;
          color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
      `}</style>

      <div className="ct-card">

        {/* Tabela */}
        <div className="ct-table-wrapper">
          <table ref={tableRef} className="ct-table">
            <thead>
              <tr>
                {columnKeys.filter((key) => !props.list[0][key].ocultColumn).map((key) => (
                  <th key={key}>
                    <div
                      className="ct-th-inner"
                      style={{ minWidth: props.list[0][key].minWidth || "auto" }}
                    >
                      {activeFilter === key ? (
                        <input
                          type="text"
                          className="ct-filter-input"
                          placeholder="Filtrar..."
                          autoFocus
                          value={filters[key] || ""}
                          onChange={(e) => handleFilterChange(key, e.target.value)}
                          onBlur={() => setActiveFilter(null)}
                        />
                      ) : (
                        <span className="ct-th-label" onClick={() => handleSort(key)}>
                          {columnHeaders[key]}
                          {sortConfig?.key === key && (
                            <i className={`ct-sort-icon fa fa-chevron-${sortConfig.direction === "asc" ? "up" : "down"}`}></i>
                          )}
                        </span>
                      )}
                      <button
                        className={`ct-filter-btn ${activeFilter === key ? "active" : ""}`}
                        onClick={(e) => { e.stopPropagation(); setActiveFilter(activeFilter === key ? null : key); }}
                        title="Filtrar coluna"
                      >
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItemsTable.map((item, index) => {
                const isSelected = selectedRows.includes(item);
                return (
                  <tr
                    key={index}
                    className={isSelected ? "ct-row-selected" : ""}
                    onClick={() => { toggleRowSelection(item); props.onRowClick?.(item); }}
                  >
                    {columnKeys.map((key) => !item[key].ocultColumn && (
                      <td key={key}>
                        <RenderCell isImage={item[key].isImage} value={item[key]?.value || ""} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer com botões */}
        {!props.hiddenButton && (
          <div className="ct-footer">
            <span className="ct-footer-info">
              <span>{selectedRows.length}</span> {selectedRows.length === 1 ? "item selecionado" : "itens selecionados"}
            </span>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                className="ct-btn ct-btn-primary"
                title={selectedRows.length > 0 ? "Confirmar seleção atual" : "Voltar para tela anterior"}
                onClick={() => { props.onConfirmList(selectedRows); setSelectedRows([]); }}
              >
                <i className={`fa ${selectedRows.length > 0 ? "fa-check" : "fa-arrow-left"}`}></i>
                {selectedRows.length > 0 ? "Confirmar Seleção" : "Voltar"}
              </button>

              {!props.maxSelection && (
                <button
                  className="ct-btn ct-btn-secondary"
                  title="Selecionar todo o conteúdo da tabela"
                  onClick={setSelectedAllRows}
                >
                  <i className="fa fa-check-double"></i>
                  Selecionar tudo
                </button>
              )}

              <button
                className="ct-btn ct-btn-secondary"
                title="Limpar seleção atual"
                onClick={() => setSelectedRows([])}
              >
                <i className="fa fa-times"></i>
                Limpar
              </button>

              <button
                className="ct-btn ct-btn-download"
                type="button"
                onClick={handleDownloadPDF}
                title="Baixar como PDF"
              >
                <i className="fa fa-download"></i>
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}