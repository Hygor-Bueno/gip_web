import React, { useEffect, useState } from 'react';
import { handleNotification, IMAGE_WEBP_QUALITY } from '../Util/Util';
import { isMobileDevice } from './Attachment/utils/fileValidation';

interface FilePreviewProps {
  base64File: string; // Base64 completo, incluindo o prefixo
  fileName?: string; // Nome do arquivo, opcional
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
          const webpDataUrl = canvas.toDataURL("image/webp", IMAGE_WEBP_QUALITY);
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

    // PDF
    if (fileType === 'application/pdf' && blobUrl) {
      const isMobile = isMobileDevice();

      // 📱 Mobile: abre em nova aba (ou download)
      if (isMobile) {
        return (
          <div style={{ textAlign: 'center' }}>
            <button
              className="btn btn-danger btn-lg"
              onClick={() => window.open(blobUrl, '_blank')}
            >
              📄 Abrir PDF
            </button>
          </div>
        );
      }

      // 💻 Desktop: preview normal em iframe
      return (
        <div style={{ textAlign: 'center' }}>
          <iframe
            src={blobUrl}
            title="Pré-visualização de PDF"
            style={{
              width: '100%',
              height: '60vh',
              border: 'none'
            }}
          />
        </div>
      );
    }



    // --- Botão estilizado para todos os arquivos não visualizáveis ---
    const fileTypeStyles = {
      zip: { name: 'ZIP', color: '#8395a7', icon: 'fa-solid fa-file-zipper text-white' },
      rar: { name: 'RAR', color: '#8395a7', icon: 'fa-solid fa-file-zipper text-white' },
      excalidraw: { name: 'Excalidraw', color: '#343a40', icon: 'fa-solid fa-pen-ruler text-white' },
      word: { name: 'Word', color: '#2b579a', icon: 'fa-solid fa-file-word text-white' },
      excel: { name: 'Excel', color: '#1d6f42', icon: 'fa-solid fa-file-excel text-white' },
      powerpoint: { name: 'PowerPoint', color: '#d24726', icon: 'fa-solid fa-file-powerpoint text-white' },
      xml: { name: 'XML', color: '#617a8c', icon: 'fa-solid fa-file-code text-white' },
      csv: { name: 'CSV', color: '#556b2f', icon: 'fa-solid fa-file-csv text-white' },
      pdf: { name: 'PDF', color: '#b71c1c', icon: 'fa-solid fa-file-pdf text-white' },
      default: { name: 'Arquivo', color: '#6c757d', icon: 'fa-solid fa-file text-white' }
    };

    const getFileTypeInfo = () => {
      const lowerCaseFileName = (props.fileName || '').toLowerCase();
      if (lowerCaseFileName.endsWith('.zip')) return fileTypeStyles.zip;
      if (lowerCaseFileName.endsWith('.rar')) return fileTypeStyles.rar;
      if (lowerCaseFileName.endsWith('.excalidraw')) return fileTypeStyles.excalidraw;
      if (lowerCaseFileName.endsWith('.doc') || lowerCaseFileName.endsWith('.docx')) return fileTypeStyles.word;
      if (lowerCaseFileName.endsWith('.xls') || lowerCaseFileName.endsWith('.xlsx')) return fileTypeStyles.excel;
      if (lowerCaseFileName.endsWith('.ppt') || lowerCaseFileName.endsWith('.pptx')) return fileTypeStyles.powerpoint;
      if (lowerCaseFileName.endsWith('.xml')) return fileTypeStyles.xml;
      if (lowerCaseFileName.endsWith('.csv')) return fileTypeStyles.csv;
      if (lowerCaseFileName.endsWith('.pdf')) return fileTypeStyles.pdf;
      if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType === 'application/msword') return fileTypeStyles.word;
      if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileType === 'application/vnd.ms-excel') return fileTypeStyles.excel;
      if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || fileType === 'application/vnd.ms-powerpoint') return fileTypeStyles.powerpoint;
      if (fileType === 'application/xml' || fileType === 'text/xml') return fileTypeStyles.xml;
      if (fileType === 'text/csv') return fileTypeStyles.csv;
      if (fileType === 'application/pdf') return fileTypeStyles.pdf;
      return fileTypeStyles.default;
    };

    const fileInfo = getFileTypeInfo();

    // Usa sempre o blobUrl para download se disponível
    const downloadUrl = blobUrl || processedBase64;
    const downloadName = props.fileName || `arquivo.${fileInfo.name.toLowerCase()}`;

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <a
          href={downloadUrl}
          download={downloadName}
          className="btn"
          style={{
            background: fileInfo.color,
            color: '#fff',
            fontWeight: 600,
            fontSize: 22,
            padding: '2rem 2.5rem',
            borderRadius: 16,
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: 'none',
            transition: 'background 0.2s'
          }}
        >
          <i className={`${fileInfo.icon} fa-3x mb-2`} />
          <span style={{ fontSize: 18, marginBottom: 4 }}>Baixar {fileInfo.name}</span>
          <span style={{
            fontSize: 13,
            opacity: 0.85,
            maxWidth: 220,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>{props.fileName}</span>
          <i className="fa-solid fa-download fa-lg mt-3 text-white" />
        </a>
      </div>
    );
  }

  return <div>{renderPreview()}</div>;
}