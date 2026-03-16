import React, { useState, useRef } from 'react';
import { handleNotification, convertImage } from '../../../../../Util/Utils';
import AttachmentFile from '../../../../../Components/Attachment/AttachmentFile';

interface ChatInputProps {
  isLoading: boolean;
  isEditing: boolean;
  onSend: any;
}

export default function ChatInput({ isLoading, isEditing, onSend }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [text, setText] = useState("");
  const [attachmentBase64, setAttachmentBase64] = useState<string>("");
  const MAX_CARACTERES = 1000;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (attachmentBase64) { 
      handleNotification("Atenção", "Você já anexou um arquivo. Remova-o antes de colar uma nova imagem.", "warning"); 
      return; 
    }
    
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = () => {
            setAttachmentBase64(reader.result as string);
          };
          break;
        }
      }
    }
  };

  const base64ToFile = (base64String: string, fileName: any): File | null => {
    if (!base64String) return null;

    try {
      const arr = base64String.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) return null;

      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      const extension = mime.split('/')[1] || 'png';
      const finalName = fileName.includes('.') ? fileName : `${fileName}.${extension}`;

      return new File([u8arr], finalName, { type: mime });
    } catch (error) {
      console.error("Erro ao converter base64 para File:", error);
      return null;
    }
  };

  const submitForm = async () => {
    const textClean = text.trim();
    if (!textClean && !attachmentBase64) return;

    if (textClean.length > 0 && textClean.length < 3 && !attachmentBase64) {
      handleNotification("Atenção", "O comentário deve ter pelo menos 3 caracteres.", "warning");
      inputRef.current?.focus();
      return;
    }

    let fileToSend: File | null = null;
    if (attachmentBase64) {
      fileToSend = base64ToFile(attachmentBase64, fileName);
    }

    const success = await onSend(textClean, fileToSend);

    if (success) {
      setText("");
      setAttachmentBase64("");
    }
  };

  return (
    <div className="p-3 bg-white border-top" style={{ borderColor: '#f0f0f0' }}>
      <div className="d-flex align-items-center">
        <div
          className={`rounded-circle me-2 d-flex justify-content-center align-items-center flex-shrink-0 bg-light ${isLoading || isEditing ? 'opacity-50' : ''}`}
          style={{ width: '40px', height: '40px', pointerEvents: isLoading || isEditing ? 'none' : 'auto' }} >
          <AttachmentFile
            item_id={0}
            captureNameDoc={(name: string) => setFileName(name)}
            base64={attachmentBase64}
            fullFiles={true}
            reset={!attachmentBase64}
            isComment={true}
            onClose={(result: any) => setAttachmentBase64(result || "")}
          />
        </div>
        <div className="flex-grow-1 rounded-pill px-3 py-1 d-flex align-items-center position-relative" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
          <input
            ref={inputRef}
            type="text"
            maxLength={MAX_CARACTERES}
            className="form-control border-0 bg-transparent shadow-none small p-2"
            placeholder={isEditing ? "Editando mensagem..." : "Digite sua mensagem"}
            value={text}
            disabled={isLoading || isEditing}
            onChange={handleTextChange}
            onKeyDown={(e) => e.key === 'Enter' && submitForm()}
            onPaste={handlePaste}
          />
          <small className={`${text.length === MAX_CARACTERES ? 'text-danger' : 'text-muted'}`}>{text.length}/{MAX_CARACTERES}</small>
        </div>
        <button className="btn btn-success rounded-circle ms-2 shadow-sm d-flex justify-content-center align-items-center flex-shrink-0" style={{ width: '45px', height: '45px', backgroundColor: '#198754' }} onClick={submitForm} disabled={(!text.trim() && !attachmentBase64) || isLoading || isEditing}>
          {isLoading ? <span className="spinner-border spinner-border-sm"></span> : <i className="fa fa-solid fa-paper-plane text-white" style={{ marginLeft: '-2px' }}></i>}
        </button>
      </div>
    </div>
  );
}