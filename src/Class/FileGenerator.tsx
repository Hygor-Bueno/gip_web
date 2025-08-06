import React, { useRef, useState } from 'react';

// Define as interfaces para as props e os tipos de dados
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

/**
 * Função para converter um array de objetos em uma string CSV.
 * @param data O array de objetos a ser convertido.
 * @returns A string CSV.
 */
const convertToCSV = (data: object[]): string => {
  if (!data.length) return '';

  // Cria o cabeçalho do CSV a partir das chaves do primeiro objeto
  const header = Object.keys(data[0]).join(',');
  // Cria as linhas do CSV a partir dos valores de cada objeto
  const rows = data.map(obj => Object.values(obj).join(','));

  return `${header}\n${rows.join('\n')}`;
};

/**
 * Função para baixar uma string CSV como um arquivo.
 * @param csv A string CSV a ser baixada.
 * @param filename O nome do arquivo.
 */
const downloadCSV = (csv: string, filename: string) => {
  try {
    // Cria um Blob a partir da string CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    // Cria uma URL para o Blob
    const url = URL.createObjectURL(blob);

    // Cria um elemento <a> para simular o download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none'; // Esconde o elemento

    // Adiciona o elemento ao corpo do documento, clica nele e remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Libera a URL do Blob
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erro ao baixar o CSV:", error);
  }
};

/**
 * Função para gerar e baixar um arquivo CSV.
 * @param getTasks A função ou o array de tarefas a ser usado.
 * @param configId Um ID de configuração (não usado diretamente nesta função, mas mantido para compatibilidade).
 * @param fileName O nome do arquivo CSV (padrão: 'documento.csv').
 */
export const generateAndDownloadCSV = (getTasks: any, configId: string, fileName: string = 'documento.csv') => {
  const tasks = getTasks; // Assume que getTasks já é o array de tarefas

  try {
    if (tasks.length > 0) {
      // Mapeia os dados das tarefas para o formato desejado para o CSV
      const jsonData = tasks.map((item: any) => ({
        "Tarefas": item.description,
        "Estado das Tarefas": item.state_description,
        "Prioridade das Tarefas": item.priority === 0 ? 'baixa' : item.priority === 1 ? 'média' : item.priority === 2 ? 'alta' : 'N/A',
        "Data de Início das Tarefas": item.initial_date,
        "Data Final das Tarefas": item.final_date,
      }));
      const csvData = convertToCSV(jsonData);
      downloadCSV(csvData, fileName);
    } else {
      // Lança um erro se não houver dados
      throw new Error("Nenhum dado encontrado para criar o CSV.");
    }
  } catch (error) {
    console.error("Erro ao gerar o CSV:", error);
  }
};

/**
 * Componente React para gerar um PDF a partir de uma lista de tarefas.
 * Exibe um spinner de carregamento enquanto o PDF está sendo preparado.
 */
export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data }) => {
  // Ref para o elemento que contém o conteúdo a ser impresso
  const contentRef = useRef<HTMLDivElement>(null);
  // Estado para controlar a exibição do indicador de carregamento
  const [isLoading, setIsLoading] = useState(false);

  // Define os cabeçalhos da tabela
  const headers = ['Tarefas', 'Estado das Tarefas', 'Prioridade', 'Data Inicial', 'Data Final', 'Percentual'];
  
  // Define os atributos das tarefas a serem exibidos na tabela, incluindo transformações
  const attributes: Attribute[] = [
    { key: 'description', label: 'Descrição' },
    { key: 'state_description', label: 'Estado' },
    { key: 'priority', label: 'Prioridade', transform: (value) => getPriorityText(value as number) },
    // Formata a data inicial para o padrão pt-BR (dd/mm/aaaa)
    { key: 'initial_date', label: 'Data Inicial', transform: (value) => new Date(value as string).toLocaleDateString('pt-BR') },
    // Formata a data final para o padrão pt-BR (dd/mm/aaaa)
    { key: 'final_date', label: 'Data Final', transform: (value) => new Date(value as string).toLocaleDateString('pt-BR') },
    { key: 'percent', label: 'Percentual', transform: (value) => (value !== undefined ? `${value}%` : 'N/A') }
  ];

  /**
   * Retorna o texto correspondente à prioridade numérica.
   * @param priority O número da prioridade (0: baixa, 1: média, 2: alta).
   * @returns O texto da prioridade.
   */
  const getPriorityText = (priority: number): string => {
    const priorityMap: { [key: number]: string } = { 0: 'baixa', 1: 'média', 2: 'alta' };
    return priorityMap[priority] || 'Não especificado';
  };

  /**
   * Função para gerar o PDF.
   * Ativa um estado de carregamento e usa um setTimeout para garantir que o DOM esteja pronto
   * antes de capturar o conteúdo para impressão.
   */
  const generatePDF = () => {
    setIsLoading(true); // Ativa o loading

    // Pequeno atraso para garantir que o DOM seja renderizado e o estado de loading seja visível
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setIsLoading(false); // Desativa o loading se a janela não puder ser aberta
        return;
      }

      const printDocument = printWindow.document;

      // Acessa o elemento table-responsive dentro do contentRef
      const tableResponsiveDiv = contentRef.current?.querySelector('.table-responsive') as HTMLElement | null;

      let originalMaxHeight = '';
      let originalOverflowY = '';

      // Salva os estilos originais e remove o overflow para garantir que todo o conteúdo seja impresso
      if (tableResponsiveDiv) {
        originalMaxHeight = tableResponsiveDiv.style.maxHeight;
        originalOverflowY = tableResponsiveDiv.style.overflowY;
        tableResponsiveDiv.style.maxHeight = 'none';
        tableResponsiveDiv.style.overflowY = 'visible';
      }

      // Captura o HTML do conteúdo a ser impresso
      const contentHtml = contentRef.current?.outerHTML || '';

      // Restaura os estilos originais do elemento table-responsive
      if (tableResponsiveDiv) {
        tableResponsiveDiv.style.maxHeight = originalMaxHeight;
        tableResponsiveDiv.style.overflowY = originalOverflowY;
      }

      // Escreve o HTML na nova janela de impressão
      printDocument.write(`
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta charset="UTF-8">
            <title>GTPP - PDF das tarefas</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            ${contentHtml}
          </body>
        </html>
      `);
      printDocument.close(); // Fecha o documento após escrever o conteúdo
      printWindow.print(); // Abre a caixa de diálogo de impressão
      setIsLoading(false); // Desativa o loading após a impressão
    }, 1000); // 100ms de atraso para permitir a renderização do DOM
  };

  return (
    <React.Fragment>
      {/* Container com a tabela que será impressa */}
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
              {/* Filtra as tarefas que possuem state_id e as mapeia para linhas da tabela */}
              {data.filter(item => item.state_id).map((item, index) => {
                return (
                  <tr key={index}>
                    {attributes.map((attr, i) => {
                      const value = item[attr.key];
                      // Aplica a transformação se houver, caso contrário, converte para string
                      const displayValue = attr.transform ? attr.transform(value) : String(value);
                      return (
                        <td key={i}>
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Botão para gerar o PDF, com indicador de carregamento */}
      <div className="text-center">
        <button 
          title="gerar PDF" 
          className="btn btn-success mt-3" 
          onClick={generatePDF}
          disabled={isLoading} // Desabilita o botão enquanto estiver carregando
        >
          {isLoading ? (
            // Exibe um spinner e texto de carregamento
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span className="ms-2">Gerando PDF...</span>
            </>
          ) : (
            // Exibe o texto normal do botão
            "Gerar PDF"
          )}
        </button>
      </div>
    </React.Fragment>
  );
};

// Exporta as funções auxiliares para uso externo, se necessário
export default PDFGenerator;
