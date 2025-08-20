import React from 'react';
import { handleNotification } from '../Util/Util';

interface FilePreviewProps {
  base64File: string; // Base64 completo, incluindo o prefixo
}

export default function FilePreview(props: FilePreviewProps) {
  // Função para extrair o tipo MIME do Base64
  const getFileTypeFromBase64 = (base64: string): string | null => {
    const match = base64.match(/^data:(.*?);base64,/);
    return match ? match[1] : null; // Retorna o tipo MIME ou null se não encontrado
  };

  // Recupera o tipo do arquivo
  const fileType = getFileTypeFromBase64(props.base64File);

  const decodeAndFormatXML = (base64: string): string => {
    try {
      const decodedXML = atob(base64.split(',')[1] || ''); // Decodifica o conteúdo Base64
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(decodedXML, 'application/xml'); // Parseia como XML

      // Verifica erros de parsing
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      if (parseError.length > 0) {
        console.error('Erro ao analisar o XML:', parseError[0].textContent);
        return 'Erro ao carregar o XML.';
      }

      const serializer = new XMLSerializer();
      const rawXML = serializer.serializeToString(xmlDoc); // Converte para string
      
      // Formata o XML de forma indentada
      return formatXML(rawXML);
    } catch (error) {
      handleNotification("Atenção!",`Erro ao decodificar ou formatar o XML: ${error}`,"danger");
      return 'Erro ao carregar o XML.';
    }
  };

  // Função para formatar XML
  const formatXML = (xml: string): string => {
    const PADDING = '  '; // Espaço para indentação
    const reg = /(>)(<)(\/*)/g; // RegEx para quebrar linhas entre tags
    let formatted = xml.replace(reg, '$1\n$2');
    let pad = 0;
    return formatted
      .split('\n')
      .map((line) => {
        let indent = 0;
        if (line.match(/.+<\/\w[^>]*>$/)) {
          indent = 0; // Linha com tag única
        } else if (line.match(/^<\/\w/)) {
          pad -= 1; // Linha de fechamento
        } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
          indent = 1; // Linha de abertura
        } else {
          indent = 0; // Conteúdo
        }
        const padding = PADDING.repeat(pad);
        pad += indent;
        return padding + line;
      })
      .join('\n');
  };

  function renderPreview() {
    if (!fileType) {
      return <p>Tipo de arquivo desconhecido. Não é possível exibir uma pré-visualização.</p>;
    }

    if (fileType.startsWith('image/')) {
      // Pré-visualização de imagens
      return <img className="rounded w-100 h-100" src={props.base64File} alt="Imagem selecionada" style={{ width: '100%', maxWidth: '500px' }} />;
    } else if (fileType === 'application/pdf') {
      // Pré-visualização de PDF
      return (
        <iframe
          src={props.base64File}
          title="Pré-visualização de PDF"
          style={{ width: '100%', height: '60vh', border: 'none' }}
        ></iframe>
      );
    } else if (fileType === 'text/xml' || fileType === 'text/csv') {
      // Pré-visualização de XML ou CSV
      return (
        <textarea
          className='border rounded'
          readOnly
          value={decodeAndFormatXML(props.base64File)} // Decodifica e formata o conteúdo Base64
          style={{  resize: "none" ,width: '60vw', height: '60vh', whiteSpace: 'pre', fontFamily: 'monospace' }}
        />
      );
    } else {
      // Pré-visualização padrão para outros tipos de arquivos
      return (
        <div style={{ padding: '20px', border: '1px solid #ccc', textAlign: 'center' }}>
          <p>Pré-visualização não disponível para este tipo de arquivo.</p>
          <a href={props.base64File} download="file" className="btn btn-primary">
            Baixar Arquivo
          </a>
        </div>
      );
    }
  }

  return <div>{renderPreview()}</div>;
}
