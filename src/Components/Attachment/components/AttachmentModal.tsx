import React, { useEffect, useState } from 'react';
import { useFileProcessor } from '../hooks/useFileProcessor';
import FilePreview from '../../FilePreview';
import { FileDropzone } from '../../FileDropzone';

interface Props {
  itemId: number;
  base64File: string;
  setBase64File: (v: string) => void;
  onClose: () => void;
  updateAttachmentFile?: (file: string, item_id: number) => Promise<void>;
  readOnly: any;
  fileInputRef?: (name: string) => void;
}

export const AttachmentModal: React.FC<Props> = ({
  itemId,
  base64File,
  setBase64File,
  onClose,
  updateAttachmentFile,
  fileInputRef,
  readOnly
}) => {
  const [fileName, setFileName] = useState('');

  const { processFile } = useFileProcessor((base64, name) => {
    setBase64File(base64);
    setFileName(name);
    if (fileInputRef) fileInputRef(name);
  });

  useEffect(() => {
    if (fileInputRef) {
      fileInputRef(fileName || 'document');
    }
  }, [fileName, fileInputRef]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.kind === 'file') {
          processFile(item.getAsFile());
          event.preventDefault();
          return;
        }
      }
    };

    window.addEventListener('paste', handlePaste as EventListener);
    return () => window.removeEventListener('paste', handlePaste as EventListener);
  }, [processFile]);

  const handleSave = async () => {
    if (!updateAttachmentFile) return;
    const cleanBase64 = base64File.split(',')[1] || '';
    await updateAttachmentFile(cleanBase64, itemId);
    onClose();
  };

  const handleRemove = async () => {
    if (updateAttachmentFile) await updateAttachmentFile('', itemId);
    setBase64File('');
    setFileName('');
  };
  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
      onClick={onClose}
      style={{ zIndex: 1050, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      <div
        className="bg-white rounded-3 shadow-lg d-flex flex-column m-3 animate__animated animate__fadeIn"
        style={{ 
          width: '100%', 
          maxWidth: '850px', 
          maxHeight: '90vh', 
          overflow: 'hidden' 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light flex-shrink-0">
          <div className="d-flex align-items-center overflow-hidden">
            <i className="fa-solid fa-paperclip text-secondary fs-5 me-2 flex-shrink-0"></i>
            <h5 className="mb-0 fw-semibold text-dark text-truncate">
              {readOnly ? 'Visualizar Anexo' : 'Gerenciar Anexo'}
            </h5>
          </div>

          {!readOnly && base64File && (
            <button
              title="Remover anexo"
              className="btn btn-sm btn-danger d-flex align-items-center px-2 px-sm-3 ms-2 flex-shrink-0"
              onClick={handleRemove}
            >
              <i className="fa-solid fa-trash-can text-white me-0 me-sm-2"></i>
              <span className="d-none d-sm-inline">Remover Imagem</span>
            </button>
          )}
        </div>
        <div 
          className={`p-3 p-md-4 flex-grow-1 d-flex flex-column w-100 ${!base64File ? 'align-items-center justify-content-center' : ''}`}
          style={{ 
            backgroundColor: '#f8f9fa',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {base64File ? (
            <div className="w-100 h-100 d-flex justify-content-center bg-white p-2 p-md-3 rounded border shadow-sm overflow-auto" style={{ height: 'fit-content' }}>
              <FilePreview base64File={base64File} fileName={fileName || 'document'} />
            </div>
          ) : !readOnly ? (
            <div className="w-100 bg-white rounded border shadow-sm p-3 p-md-4 d-flex align-items-center justify-content-center" style={{ minHeight: '30vh' }} >
              <FileDropzone
                  onFileSelected={(file) => processFile(file)}
                  accept=".pdf,.doc,.docx,.xml,.ppt,.pptx,.xls,.xlsx,.csv,.excalidraw,.zip,.rar,image/*"
              />
            </div>
          ) : (
            <div className="text-center text-muted p-4 p-md-5 d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '30vh' }}>
              <i className="fa-solid fa-folder-open fa-3x fa-sm-4x mb-3 opacity-25"></i>
              <p className="mb-0 fs-6 fs-md-5">Nenhum arquivo encontrado.</p>
            </div>
          )}
        </div>
        <div className="p-3 border-top d-flex justify-content-end gap-2 bg-white flex-shrink-0">
          <button className="btn btn-outline-secondary px-3 px-md-4 fw-medium" onClick={onClose}>
            {readOnly ? 'Fechar' : 'Voltar'}
          </button>
          
          {!readOnly && (
            <button 
              className="btn btn-success px-3 px-md-4 fw-medium d-flex align-items-center shadow-sm" 
              disabled={!itemId && itemId !== 0}
              onClick={handleSave}
            >
              <i className="fa-solid text-white fa-check me-2"></i>
              Salvar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};