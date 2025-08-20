import React, { useRef } from 'react';

interface PDFGeneratorProps {
  data: Task[];
}

interface Task {
  description: string;
  state_description: string;
  priority: number;
  initial_date: string;
  final_date: string;
  state_id: string;
  percent?: number;
}

interface Attribute {
  key: keyof Task;
  label: string;
  transform?: (value: string | number | undefined) => string;
}

export const generateAndDownloadCSV = (getTasks: any, configId: string, fileName: string = 'documento.csv') => {
  const tasks = getTasks;

  try {
    if (tasks.length > 0) {
      const jsonData = tasks.map((item:any) => ({
        "Tarefas": item.description,
        "Estado das Tarefas": item.state_description,
        "Prioridade das Tarefas": item.priority === 0 ? 'baixa' : item.priority === 1 ? 'média' : item.priority === 2 ? 'alta' : 'N/A',
        "Data de Início das Tarefas": item.initial_date,
        "Data Final das Tarefas": item.final_date,
      }));
      const csvData = convertToCSV(jsonData);
      downloadCSV(csvData, fileName);
    } else {
      throw new Error("Nenhum dado encontrado para criar o CSV.");
    }
  } catch (error) {
    console.error("Erro ao gerar o CSV:", error);
  }
};

const convertToCSV = (data: object[]): string => {
  if (!data.length) return '';

  const header = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).join(','));

  return `${header}\n${rows.join('\n')}`;
};

const downloadCSV = (csv: string, filename: string) => {
  try {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erro ao baixar o CSV:", error);
  }
};

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const headers = ['Tarefas', 'Estado das Tarefas', 'Prioridade', 'Data Inicial', 'Data Final', 'Percentual'];
  const attributes: Attribute[] = [
    { key: 'description', label: 'Descrição' },
    { key: 'state_description', label: 'Estado' },
    { key: 'priority', label: 'Prioridade', transform: (value) => getPriorityText(value as number) },
    { key: 'initial_date', label: 'Data Inicial', transform: (value) => new Date(value as string).toLocaleDateString() },
    { key: 'final_date', label: 'Data Final', transform: (value) => new Date(value as string).toLocaleDateString() },
    { key: 'percent', label: 'Percentual', transform: (value) => (value !== undefined ? `${value}%` : 'N/A') }
  ];

  const getPriorityText = (priority: number): string => {
    const priorityMap: { [key: number]: string } = { 0: 'baixa', 1: 'média', 2: 'alta' };
    return priorityMap[priority] || 'Não especificado';
  };

  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printDocument = printWindow.document;

    printDocument.write(`
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          ${contentRef.current?.outerHTML || ''}
        </body>
      </html>
    `);
    printWindow.print();
    printDocument.close();
  };

  return (
    <React.Fragment>
      <div ref={contentRef} className="container">
        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.filter(item => item.state_id).map((item, index) => (
                <tr key={index}>
                  {attributes.map((attr, i) => {
                    const value = item[attr.key];
                    const displayValue = attr.transform ? attr.transform(value) : String(value);
                    return (
                      <td key={i}>
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-center">
        <button title="gerar PDF" className="btn btn-success mt-3" onClick={generatePDF}>Gerar PDF</button>
      </div>
    </React.Fragment>
  );
};
