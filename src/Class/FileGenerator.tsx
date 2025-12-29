import React, { useRef, useState } from 'react';
import { styleStringFunction } from '../stylecss/style';

// === TIPOS ===
export interface Task {
  description: string;
  state_description: string;
  priority: number;
  initial_date: string;
  final_date: string;
  state_id: string;
  percent?: number;
}

interface TaskExporterProps {
  data: Task[];
}

// === UTILIDADES ===
const formatDateBR = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Inválida' : date.toLocaleDateString('pt-BR');
  } catch {
    return 'Inválida';
  }
};

const getPriorityText = (p: number): string => {
  return p === 0 ? 'Baixa' : p === 1 ? 'Média' : p === 2 ? 'Alta' : 'N/A';
};

const sanitize = (str: string): string => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// === EXPORTAÇÃO CSV (EXCEL 100%) ===
export const generateAndDownloadCSV = (
  tasks: Task[],
  baseFilename: string = 'documento'
) => {
  if (!tasks || tasks.length === 0) {
    alert('Nenhuma tarefa para exportar.');
    return;
  }

  const data = tasks.map(t => ({
    'Tarefa': t.description,
    'Estado': t.state_description,
    'Prioridade': getPriorityText(t.priority),
    'Início': formatDateBR(t.initial_date),
    'Fim': formatDateBR(t.final_date),
    'Progresso (%)': t.percent !== undefined ? `${t.percent}` : 'N/A',
  }));

  const headers = Object.keys(data[0]);
  const rows: string[] = [
    headers.map(h => `"${h}"`).join(';'),
    ...data.map(row =>
      headers
        .map(h => `"${String((row as any)[h]).replace(/"/g, '""').replace(/\n/g, ' ')}"`)
        .join(';')
    ),
  ];

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  const filename = `${baseFilename}_${dateStr}_${timeStr}.csv`;

  const csv = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: filename,
    style: { display: 'none' },
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// === ATRIBUTOS TIPADOS (SEM any) ===
type Attribute =
  | { key: Exclude<keyof Task, 'priority'>; label: string; transform?: (v: any) => string }
  | { key: 'priority'; label: string; transform: (v: number) => string };

const headers = ['Tarefa', 'Estado', 'Prioridade', 'Início', 'Fim', 'Progresso'];
const attrs: Attribute[] = [
  { key: 'description', label: 'Tarefa' },
  { key: 'state_description', label: 'Estado' },
  { key: 'priority', label: 'Prioridade', transform: getPriorityText },
  { key: 'initial_date', label: 'Início', transform: formatDateBR },
  { key: 'final_date', label: 'Fim', transform: formatDateBR },
  {
    key: 'percent',
    label: 'Progresso',
    transform: (v?: number) => (v !== undefined ? `${v}%` : '—'),
  },
];

// === COMPONENTE PRINCIPAL ===
const TaskExporter: React.FC<TaskExporterProps> = ({ data }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<'pdf' | 'csv' | null>(null);

  const tasks = data.filter(t => t.state_id);
  const today = new Date().toLocaleDateString('pt-BR');
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // === GERAR PDF ===
  const generatePDF = () => {
    if (!tasks.length) return alert('Nenhuma tarefa para gerar PDF.');

    setLoading('pdf');
    const printWin = window.open('', '_blank', 'width=1200,height=900');
    if (!printWin) {
      alert('Permita pop-ups para gerar o PDF.');
      setLoading(null);
      return;
    }

    const tableHTML = `
      <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:15px;">
        <thead>
          <tr style="background:#f8f9fa;">
            ${headers.map(h => `<th style="border:1px solid #ddd; padding:10px; text-align:left;">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${tasks
            .map(
              task => `
            <tr>
              ${attrs
                .map(attr => {
                  let display: string;
                  if (attr.key === 'priority') {
                    display = attr.transform!(task.priority);
                  } else {
                    const value = task[attr.key];
                    display = attr.transform ? attr.transform(value) : sanitize(String(value ?? ''));
                  }
                  return `<td style="border:1px solid #ddd; padding:8px;">${display}</td>`;
                })
                .join('')}
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    `;

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>GTPP - Relatório de Tarefas</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          ${styleStringFunction()}
          body { font-family: 'Poppins', sans-serif; margin: 0; padding: 0; background: #f9f9f9; }
          .page { padding: 40px 30px 60px; page-break-after: always; position: relative; background: white; }
          .header { position: running(header); text-align: center; font-size: 12px; color: #555; padding-bottom: 10px; border-bottom: 1px solid #eee; }
          .footer { position: running(footer); text-align: center; font-size: 11px; color: #777; padding-top: 10px; border-top: 1px solid #eee; }
          .content { margin-top: 20px; }
          h1 { margin: 0 0 8px; font-size: 24px; color: #1a1a1a; }
          p { margin: 0; color: #555; font-size: 14px; }
          @page {
            size: A4;
            margin: 1cm;
            @top-center { content: element(header); }
            @bottom-center { content: element(footer); }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <strong>Relatório de Tarefas - GTPP</strong> | ${today} às ${now}
        </div>
        <div class="footer">
          Página <span class="pageNumber"></span> de <span class="totalPages"></span> | Sistema GTPP
        </div>
        <div class="page">
          <div style="margin-bottom:20px;">
            <h1>Relatório de Tarefas</h1>
            <p>Total: ${tasks.length} tarefa(s)</p>
          </div>
          <div class="content">${tableHTML}</div>
        </div>
      </body>
      </html>
    `);

    printWin.document.close();
    printWin.focus();

    setTimeout(() => {
      printWin.print();
      setLoading(null);
      printWin.onafterprint = () => printWin.close();
    }, 800);
  };

  // === GERAR CSV ===
  const generateCSV = () => {
    setLoading('csv');
    setTimeout(() => {
      generateAndDownloadCSV(tasks, 'GTPP-documento');
      setLoading(null);
    }, 300);
  };

  // === RENDER ===
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', color: '#1a1a1a', marginBottom: '10px' }}>
        Pré-visualização do Relatório
      </h2>
      <p style={{ textAlign: 'center', color: '#555', marginBottom: '20px' }}>
        {tasks.length} tarefa(s) com estado definido
      </p>

      {/* PRÉ-VISUALIZAÇÃO VISÍVEL */}
      <div
        ref={printRef}
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflowX: 'auto',
          marginBottom: '20px',
        }}
      >
        <div className="table-responsive">
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
              minWidth: '800px',
            }}
            className="table table-striped table-bordered"
          >
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {headers.map((h, i) => (
                  <th key={i} style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, i) => (
                <tr key={i}>
                  {attrs.map((a, j) => {
                    let display: string;
                    if (a.key === 'priority') {
                      display = a.transform!(t.priority);
                    } else {
                      const value = t[a.key];
                      display = a.transform ? a.transform(value) : String(value ?? '');
                    }
                    return (
                      <td
                        key={j}
                        style={{ padding: '10px', border: '1px solid #ddd', whiteSpace: 'normal' }}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTÕES DE AÇÃO */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={generatePDF}
          disabled={loading === 'pdf' || tasks.length === 0}
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
          }}
          aria-label="Gerar PDF"
        >
          {loading === 'pdf' ? (
            <>
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '8px' }}>
                Loading
              </span>
              Gerando PDF...
            </>
          ) : (
            'Gerar PDF'
          )}
        </button>

        <button
          onClick={generateCSV}
          disabled={loading === 'csv' || tasks.length === 0}
          style={{
            margin: '0 10px',
            padding: '14px 28px',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            borderRadius: '10px',
            cursor: tasks.length === 0 ? 'not-allowed' : 'pointer',
            background: tasks.length === 0 ? '#ccc' : '#007bff',
            color: 'white',
            minWidth: '160px',
            transition: 'all 0.2s',
            boxShadow: '0 4px 8px rgba(0,123,255,0.3)',
          }}
          aria-label="Exportar Excel"
        >
          {loading === 'csv' ? (
            <>
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '8px' }}>
                Loading
              </span>
              Gerando Excel...
            </>
          ) : (
            'Exportar Excel'
          )}
        </button>
      </div>

      {tasks.length === 0 && (
        <p style={{ textAlign: 'center', color: '#888', marginTop: '20px', fontStyle: 'italic' }}>
          Nenhuma tarefa com estado definido para exibir.
        </p>
      )}

      {/* Spinner animado */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default TaskExporter;