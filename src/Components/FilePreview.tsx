import React, { useEffect, useState } from 'react';
import { handleNotification, IMAGE_WEBP_QUALITY } from '../Util/Util';
import { isMobileDevice } from './Attachment/utils/fileValidation';

interface FilePreviewProps {
  base64File: string;
  fileName?: string;
}

export default function FilePreview(props: FilePreviewProps) {

  const [processedBase64, setProcessedBase64] = useState<string>(props.base64File);

  const getFileTypeFromBase64 = (base64: string): string | null => {
    const match = base64.match(/^data:(.*?);base64,/);
    return match ? match[1] : null;
  };

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
      setProcessedBase64(processedBase64);
    }
  }, [processedBase64]);

  function base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i++) { byteArrays.push(byteCharacters.charCodeAt(i)); }
    return new Blob([new Uint8Array(byteArrays)], { type: contentType });
  }

  const blob = fileType ? base64ToBlob(processedBase64, fileType) : null;
  const blobUrl = blob ? URL.createObjectURL(blob) : null;

  // Função utilitária para gerar o nome do arquivo de imagem para download
  const getImageDownloadName = () => {
    let ext = 'png';
    if (fileType) {
      const mimeMatch = fileType.split('/');
      if (mimeMatch.length === 2) ext = mimeMatch[1];
    }
    const fallbackName = `imagem_${Date.now()}.${ext}`;
    if (!props.fileName) return fallbackName;
    return props.fileName.includes('.') ? props.fileName : `${props.fileName}.${ext}`;
  };

  function renderPreview() {
    if (!fileType) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center text-muted h-100">
          <i className="fa-solid fa-triangle-exclamation fa-3x mb-3 opacity-50"></i>
          <p className="mb-0 text-center">Tipo de arquivo desconhecido.<br />Não é possível exibir a pré-visualização.</p>
        </div>
      );
    }

    // --- IMAGENS ---
    if (fileType.startsWith('image/')) {
      return (
        <div className="d-flex justify-content-center w-100 position-relative" style={{ padding: '10px 0' }} >
          <div className="position-relative d-inline-block" style={{ maxWidth: '100%' }}>

            <img
              className="img-fluid rounded shadow-sm border"
              src={processedBase64}
              alt="Pré-visualização"
              style={{
                maxWidth: '100%',
                height: 'auto',
                objectFit: 'contain'
              }}
            />

            <a
              href={processedBase64}
              download={getImageDownloadName()}
              className="btn btn-primary position-absolute d-flex align-items-center justify-content-center shadow"
              title="Baixar imagem"
              style={{
                top: '10px',
                right: '8px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                opacity: 0.85,
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = '0.85';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <i className="fa-solid fa-download text-white"></i>
            </a>

          </div>
        </div>
      );
    }

    // --- PDF ---
    if (fileType === 'application/pdf' && blobUrl) {
      const isMobile = isMobileDevice();
      if (isMobile) {
        return (
          <div className="d-flex justify-content-center align-items-center h-100 w-100" style={{ minHeight: '200px' }}>
            <a href={blobUrl} download={props.fileName || `documento_${Date.now()}.pdf`} className="btn btn-danger btn-lg d-flex flex-column align-items-center p-4 rounded-4 shadow-sm text-decoration-none">
              <i className="fa-solid fa-file-pdf fa-3x mb-2"></i>
              <span>Baixar Documento PDF</span>
            </a>
          </div>
        );
      }
      return (
        <div className="w-100 h-100 rounded overflow-hidden" style={{ minHeight: '50vh' }}>
          <iframe src={blobUrl} title="Pré-visualização de PDF" className="w-100 h-100 border-0" />
        </div>
      );
    }

    // --- OUTROS ARQUIVOS ---
    const fileTypeStyles = {
      zip: { name: 'ZIP', color: '#8395a7', icon: 'fa-solid fa-file-zipper' },
      rar: { name: 'RAR', color: '#8395a7', icon: 'fa-solid fa-file-zipper' },
      excalidraw: { name: 'Excalidraw', color: '#343a40', icon: 'fa-solid fa-pen-ruler' },
      word: { name: 'Word', color: '#2b579a', icon: 'fa-solid fa-file-word' },
      excel: { name: 'Excel', color: '#1d6f42', icon: 'fa-solid fa-file-excel' },
      powerpoint: { name: 'PowerPoint', color: '#d24726', icon: 'fa-solid fa-file-powerpoint' },
      xml: { name: 'XML', color: '#617a8c', icon: 'fa-solid fa-file-code' },
      csv: { name: 'CSV', color: '#556b2f', icon: 'fa-solid fa-file-csv' },
      pdf: { name: 'PDF', color: '#b71c1c', icon: 'fa-solid fa-file-pdf' },
      default: { name: 'Arquivo', color: '#6c757d', icon: 'fa-solid fa-file' }
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
    const downloadUrl = blobUrl || processedBase64;
    const downloadName = props.fileName || `arquivo.${fileInfo.name.toLowerCase()}`;
    return (
      <div className="d-flex justify-content-center align-items-center w-100 h-100" style={{ minHeight: '250px' }}>
        <a href={downloadUrl} download={downloadName} className="btn text-white d-flex flex-column align-items-center p-4 rounded-4 shadow" style={{ backgroundColor: fileInfo.color, transition: 'all 0.2s', textDecoration: 'none', minWidth: '220px' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
          <i className={`${fileInfo.icon} fa-3x mb-3`}></i>
          <span className="fs-5 fw-semibold text mb-1">Baixar {fileInfo.name}</span>
          <span className="small opacity-75 text-truncate text-center" style={{ maxWidth: '200px' }}>{props.fileName}</span>
          <i className="fa-solid fa-download fs-4 mt-3"></i>
        </a>
      </div>
    );
  }

  return <div className="w-100 h-100 d-flex flex-column">{renderPreview()}</div>;
}