import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { tItemTable } from "../types/types";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable'; // Importe o autoTable diretamente
import { convertDate, convertTime } from "../Util/Utils";

const defaultImage = require('../Assets/Image/groupCLPP.png');

const RenderCell = React.memo(({ value, isImage }: { value: string; isImage?: boolean }) => {
  const isValidDateString = (s: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const [y, m, d] = s.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  };
  return isImage ? (
    <img className="photoCircle rounded-circle" src={value ? `data:image/png;base64,${value}` : defaultImage} alt="" />
  ) : (
    <span>{isValidDateString(value) ? convertDate(value, true) : value}</span>
  );
});

interface CustomTableProps {
  list: tItemTable[];
  onConfirmList: (selected: tItemTable[]) => void;
  selectedItems?: tItemTable[];
  maxSelection?: number;
  selectionList?: tItemTable[];
  selectionKey?: string;
  hiddenButton?: boolean;
  hideSelectAll?: boolean;
  onRowClick?: any;
}

export default function CustomTable(props: CustomTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<tItemTable[]>(props.selectedItems || []);
  // Função para verificar se uma linha deve ser selecionada
  const isRowSelected = (row: tItemTable): boolean => {
    if (!props.selectionList || !props.selectionKey || !row[props.selectionKey]) return false;
    return props.selectionList.some(item => {
      if (!item[props.selectionKey!]) return false;
      return item[props.selectionKey!].value === row[props.selectionKey!].value;
    });
  };


  // Referência para a tabela
  const tableRef = useRef<HTMLTableElement>(null);

  // Função para gerar o PDF
  function handleDownloadPDF() {
    setActiveFilter(null); // close any open column filter input before reading headers
    if (tableRef.current) {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [297, 210], // Largura x Altura (em milímetros)
      });

      // Extrai os dados da tabela
      const headers: string[] = [];
      const rows: string[][] = [];

      // Extrai os cabeçalhos (th)
      const headerCells = tableRef.current.querySelectorAll('thead th');
      headerCells.forEach((cell) => {
        headers.push(cell.textContent || '');
      });

      // Extrai as linhas (tr) e células (td)
      const tableRows = tableRef.current.querySelectorAll('tbody tr');
      tableRows.forEach((row) => {
        const rowData: string[] = [];
        row.querySelectorAll('td').forEach((cell) => {
          rowData.push(cell.textContent || '');
        });
        rows.push(rowData);
      });

      // Adiciona a tabela ao PDF usando autoTable
      autoTable(doc, {
        head: [headers], // Cabeçalhos
        body: rows, // Linhas
        margin: { top: 10, left: 5, right: 5, bottom: 10 }, // Margens reduzidas
        styles: {
          fontSize: 10, // Tamanho da fonte
          cellPadding: 3, // Espaçamento interno das células
        },
      });

      // Salva o PDF
      doc.save('tabela.pdf');
    }
  };

  // Efeito para adicionar os itens da selectionList à lista de selecionados na primeira renderização
  const selectionListKey = props.selectionKey;
  const selectionListStr = JSON.stringify(props.selectionList?.map(i => i[selectionListKey ?? ""]?.value));
  useEffect(() => {
    if (props.selectionList && props.selectionKey) {
      const itemsToSelect = props.list.filter(row => isRowSelected(row));
      setSelectedRows((prev) => {
        const prevKeys = new Set(prev.map(r => r[props.selectionKey!]?.value));
        const newItems = itemsToSelect.filter(item => !prevKeys.has(item[props.selectionKey!]?.value));
        return newItems.length ? [...prev, ...newItems] : prev;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionListStr, selectionListKey]);

  // Atualiza o estado selectedRows quando props.selectedItems mudar
  useEffect(() => {
    if (props.selectedItems) {
      setSelectedRows(props.selectedItems);
    }
  }, [props.selectedItems]);

  // All hooks must run unconditionally — early return comes after
  const columnKeys = props.list?.length ? Object.keys(props.list[0]) : [];
  const columnHeaders = useMemo(() =>
    columnKeys.reduce((acc, key) => {
      acc[key] = props.list[0]?.[key]?.tag ?? key;
      return acc;
    }, {} as { [key: string]: string }),
  [props.list, columnKeys.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const sortedItemTable = useMemo(() => [...(props.list ?? [])].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const rawA = a[key]?.value ?? "";
    const rawB = b[key]?.value ?? "";
    const valueA = isNaN(Number(rawA)) ? rawA.toLowerCase() : Number(rawA);
    const valueB = isNaN(Number(rawB)) ? rawB.toLowerCase() : Number(rawB);
    if (valueA < valueB) return direction === "asc" ? -1 : 1;
    if (valueA > valueB) return direction === "asc" ? 1 : -1;
    return 0;
  }), [props.list, sortConfig]);

  const filteredItemsTable = useMemo(() =>
    sortedItemTable.filter((item) =>
      Object.keys(filters).every((key) =>
        item[key]?.value?.toLowerCase().includes(filters[key].toLowerCase())
      )
    ),
  [sortedItemTable, filters]);

  if (!props.list?.length) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100 py-5 text-muted">
        <i className="fa fa-search fa-2x mb-3" style={{ color: "#bed989" }}></i>
        <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Nenhum resultado encontrado</span>
        <span style={{ fontSize: "0.78rem" }}>Tente ajustar os filtros aplicados</span>
      </div>
    );
  }

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleRowSelection = (item: tItemTable) => {
    setSelectedRows((prev) => {
      if (prev.includes(item)) {
        return prev.filter((row) => row !== item); // Remove o item da lista
      } else {
        if (props.maxSelection && prev.length >= props.maxSelection) {
          return prev; // Não adiciona mais itens se o limite for atingido
        }
        return [...prev, item]; // Adiciona o item à lista
      }
    });
  };

  function setSelectedAllRows() {
    setSelectedRows([...props.list]);
  }

  return (
    <div className="d-flex flex-column w-100 h-100">
      <div className="overflow-auto flex-grow-1" style={{ minHeight: 0 }}>
        <table ref={tableRef} className="table table-bordered table-striped">
          <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 0 }}>
            <tr>
              {columnKeys.filter((key) => !props.list[0][key]?.ocultColumn).map((key) => (
                <th key={key} className="position-relative">
                  <div style={{ minWidth: props.list[0][key].minWidth ? props.list[0][key].minWidth : "auto" }} className="d-flex justify-content-between align-items-center">
                    {activeFilter === key ? (
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Filtrar"
                        autoFocus
                        value={filters[key] || ""}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        onBlur={() => setActiveFilter(null)}
                      />
                    ) : (
                      <span onClick={() => handleSort(key)}>
                        {columnHeaders[key]} {sortConfig?.key === key ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                      </span>
                    )}
                    <button className="btn btn-sm btn-light ms-2" onClick={(e) => { e.stopPropagation(); setActiveFilter(activeFilter === key ? null : key); }}>
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItemsTable.map((item, index) => {
              const stableKey = props.selectionKey ?? Object.keys(item)[0];
              const isSelected = selectedRows.some(r => r[stableKey]?.value === item[stableKey]?.value);
              return (
                <tr key={index} className={isSelected ? "table-success" : ""} onClick={() => {
                    toggleRowSelection(item);
                    props.onRowClick?.(item); // chat de vez pegar um por um quero fazer um push e eviar o proximo dado para minha lista
                  }}>
                  {columnKeys.map((key) => !item[key]?.ocultColumn && (
                    <td key={key} className="py-2">
                      <RenderCell isImage={item[key]?.isImage} value={item[key]?.value || ""} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!props.hiddenButton && (
        <div className="w-100 d-flex justify-content-between gap-4">
          <button title={selectedRows.length > 0 ? "Confirmar seleção atual" : "Voltar para tela anterior"} className="btn btn-primary mt-3 w-25" onClick={() => { 
              props.onConfirmList(selectedRows);  
              setSelectedRows([]);
            }}>
            {selectedRows.length > 0 ? 'Confirmar Seleção' : 'Voltar'}
          </button>
          {
            !props.maxSelection && !props.hideSelectAll && <button title={"Selecionar todo o conteúdo da tabela"} className="btn btn-primary mt-3 w-25" onClick={() => { setSelectedAllRows(); }}> Selecionar tudo</button>
          }

          <button title="Limpar seleção atual" className="btn btn-secondary text-white mt-3 w-25" onClick={() => setSelectedRows([])}>
            Limpar Seleção
          </button>
          <button className="btn btn-success mt-3 w-25" type="button" onClick={handleDownloadPDF} title='Baixar'>Download</button>
        </div>
      )}
    </div>
  );
}