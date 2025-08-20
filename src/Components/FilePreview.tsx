import React, { useEffect, useState } from 'react';
import { handleNotification, IMAGE_WEBP_QUALITY } from '../Util/Util';

interface FilePreviewProps {
  base64File: string; // Base64 completo, incluindo o prefixo
}

export default function FilePreview(props: FilePreviewProps) {

  const [processedBase64, setProcessedBase64] = useState<string>(props.base64File);

  // Função para extrair o tipo MIME do Base64
  const getFileTypeFromBase64 = (base64: string): string | null => {
    const match = base64.match(/^data:(.*?);base64,/);
    return match ? match[1] : null; // Retorna o tipo MIME ou null se não encontrado
  };

  // Recupera o tipo do arquivo
  const fileType: any = getFileTypeFromBase64(processedBase64);


  const convertToWebP = (base64: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Erro ao obter contexto do canvas");

        ctx.drawImage(img, 0, 0);
        try {
          const webpDataUrl = canvas.toDataURL("image/webp", IMAGE_WEBP_QUALITY); // qualidade alta
          resolve(webpDataUrl);
        } catch (error) {
          reject("Erro ao converter para WebP: " + error);
        }
      };
      img.onerror = () => reject("Erro ao carregar imagem");
    });
  };


  useEffect(() => {
    const shouldConvertToWebP =
      getFileTypeFromBase64(processedBase64)?.startsWith("image/") &&
      getFileTypeFromBase64(processedBase64) !== "image/webp";

    if (shouldConvertToWebP) {
      convertToWebP(processedBase64)
        .then((converted) => setProcessedBase64(converted))
        .catch((err) =>
          handleNotification("Erro", "Falha ao converter imagem para WebP: " + err, "danger")
        );
    } else {
      setProcessedBase64(processedBase64); // Usa como está
    }
  }, [processedBase64]);


  

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
    const PADDING = '  '; // Espaço para indentação
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

  const openImageInNewTab = () => {
    const newWindow = window.open();
    if(newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-LN+7fdVzj6u52u30Kp6M/trliBMCMKTyK833zpbD+pXdCLuTusPj697FH4R/5mcr" crossorigin="anonymous">
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js" integrity="sha384-ndDqU0Gzau9qJ1lfW4pNLlhNTkCfHzAVBReH9diLvGRem5+R9g2FzA8ZGN954O5Q" crossorigin="anonymous"></script>
            <title>GTPP - Visualizador da Imagem</title>
            <style>
              body { margin: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; background-color: #f0f0f0; padding: 20px; box-sizing: border-box; }
              .container { text-align: center; background-color: #151111; padding: 25px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); max-width: 90%; width: auto; }
              img { max-width: 100%; max-height: 70vh; display: block; margin: 0 auto 20px auto; border: 1px solid #ddd; border-radius: 4px;}
              .form-group { margin-bottom: 15px; display: flex; flex-direction: column; align-items: center; }
              .form-control { width: 80%; max-width: 300px; margin-bottom: 10px; }
              .btn-custom { width: 80%; max-width: 300px; }
            </style>
          </head>
          <body>
            <div class="container bg-light">
              <div class="d-flex flex-column align-items-center">
                <img id="imageViewer" src="${processedBase64}" alt="Imagem" />
                <div class="form-group">
                  <label htmlFor="fileNameInput" class="form-label">Nome do arquivo:</label>
                  <input type="text" id="fileNameInput" class="form-control" value="imagem_download" />
                </div>
                <button id="downloadBtn" class="btn btn-primary btn-custom">Download Imagem</button>
              </div>
            </div>

            <script>
              document.addEventListener('DOMContentLoaded', () => {
                const downloadBtn = document.getElementById('downloadBtn');
                const fileNameInput = document.getElementById('fileNameInput');
                const imageSrc = document.getElementById('imageViewer').src;

                // Tenta extrair a extensão da string base64 ou usa .png como padrão
                let fileExtension = '.png'; // Default
                if (imageSrc.startsWith('data:image/')) {
                    const mimeType = imageSrc.substring(5, imageSrc.indexOf(';'));
                    if (mimeType.includes('/')) {
                        fileExtension = '.' + mimeType.split('/')[1];
                    }
                }
                
                // Define um valor inicial para o input com base no timestamp
                const defaultFileName = 'imagem_' + Date.now();
                fileNameInput.value = defaultFileName;


                downloadBtn.addEventListener('click', () => {
                  const fileName = fileNameInput.value.trim();
                  if (fileName) {
                    const a = document.createElement('a');
                    a.href = imageSrc;
                    // Garante que o nome do arquivo tenha uma extensão
                    a.download = fileName + (fileName.endsWith(fileExtension) ? '' : fileExtension);
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  } else {
                    alert('Por favor, digite um nome para o arquivo.');
                  }
                });
              });
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  }

  function base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }

    return new Blob([new Uint8Array(byteArrays)], { type: contentType });
  }

  // A Blob URL é criada uma vez no render, o que é eficiente
  const blob = fileType ? base64ToBlob(processedBase64, fileType) : null;
  const blobUrl = blob ? URL.createObjectURL(blob) : null;


  function renderPreview() {
    if (!fileType) {
      return <p>Tipo de arquivo desconhecido. Não é possível exibir uma pré-visualização.</p>;
    }

    // Imagens
    if (fileType.startsWith('image/')) {
      return (
        <div onClick={openImageInNewTab} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img className="rounded w-100 h-100" src={processedBase64} alt="Imagem" style={{ width: '100%', maxWidth: '500px' }} />
        </div>
      );
    }

    // PDF com blob URL
    if (fileType === 'application/pdf' && blobUrl) {
      return (
        <div style={{ textAlign: 'center' }}>
          <iframe
            src={blobUrl}
            title="Pré-visualização de PDF"
            style={{ 
              width: '100%', 
              height: '60vh', 
              border: 'none' 
            }} />
          <br />
        </div>
      );
    }

    // XML ou CSV
    if (fileType === 'text/xml' || fileType === 'text/csv') {
      return (
        <textarea
          className="border rounded"
          readOnly
          value={decodeAndFormatXML(processedBase64)}
          style={{ resize: "none", 
            width: '60vw', 
            height: '60vh', 
            whiteSpace: 'pre', 
            fontFamily: 'monospace' 
          }}
        />
      );
    }

    // === Adicionei o tratamento específico para DOCX aqui ===
    if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const suggestedFileName = `documento_${Date.now()}.docx`; // Nome sugerido
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Pré-visualização não disponível para arquivos DOCX.</p>
                {blobUrl && (
                    <a href={blobUrl} download={suggestedFileName} className="btn btn-primary">
                        Baixar Documento Word
                    </a>
                )}
                {!blobUrl && <p>Carregando...</p>}
            </div>
        );
    }

    // Word ou Excel (outros formatos ou genérico)
    const wordExcelTypes = [
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];

    if (wordExcelTypes.includes(fileType)) {
      const suggestedFileName = `${fileType.includes('word') ? 'documento' : 'planilha'}_${Date.now()}.${fileType.includes('word') ? 'doc' : 'xlsx'}`;
      return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Pré-visualização não disponível para este tipo de arquivo do Office.</p>
          {blobUrl && (
              <a href={blobUrl} download={suggestedFileName} className="btn btn-success">
                Baixar {fileType.includes('word') ? 'Word (antigo)' : 'Excel'}
              </a>
          )}
          {!blobUrl && <p>Carregando...</p>}
        </div>
      );
    }

    // Outros tipos não suportados
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', textAlign: 'center' }}>
        <p>Pré-visualização não disponível para este tipo de arquivo.</p>
        {blobUrl && (
            <a href={blobUrl} download="arquivo_desconhecido" className="btn btn-primary">
              Baixar Arquivo
            </a>
        )}
        {!blobUrl && <p>Carregando...</p>}
      </div>
    );
  }

  return <div>{renderPreview()}</div>;
}