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
}

export const AttachmentModal: React.FC<Props> = ({
  itemId,
  base64File,
  setBase64File,
  onClose,
  updateAttachmentFile,
}) => {
  const [fileName, setFileName] = useState('');

  const { processFile } = useFileProcessor((base64, name) => {
    setBase64File(base64);
    setFileName(name);
  });

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        style={{ maxWidth: '75%', maxHeight: '90%' }}
        className="d-flex flex-column align-items-center bg-white p-4 rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-center justify-content-between w-100">
          <span className="h5">Anexo:</span>
          {base64File && (
            <button
              title="Remover anexo"
              className="btn btn-danger m-2 fa-solid fa-trash"
              onClick={async () => {
                if (updateAttachmentFile) await updateAttachmentFile('', itemId);
                setBase64File('');
                setFileName('');
              }}
            />
          )}
        </div>

        <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100 overflow-auto">
          {base64File ? (
            <FilePreview base64File={base64File} fileName={fileName || 'document'} />
          ) : (
            <FileDropzone
                onFileSelected={(file) => processFile(file)}
                accept=".pdf,.doc,.docx,.xml,.ppt,.pptx,.xls,.xlsx,.csv,.excalidraw,.zip,.rar,image/*"
            />
          )}
        </div>

        <div className="d-flex justify-content-around w-100">
          <button className="btn btn-success m-2" disabled={!itemId} onClick={handleSave}>
            Salvar
          </button>
          <button className="btn btn-danger m-2" onClick={onClose}>
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};
