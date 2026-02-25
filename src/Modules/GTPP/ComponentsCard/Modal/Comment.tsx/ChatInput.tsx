import React, { useState, useRef, useEffect } from 'react';
import { handleNotification, convertImage } from '../../../../../Util/Util';
import imageUser from "../../../../../Assets/Image/user.png";

interface ChatInputProps {
  userList: any[];
  isLoading: boolean;
  isEditing: boolean;
  onSend: (text: string, file: File | null, mentionedUsers: any[]) => Promise<boolean>;
}

export default function ChatInput({ userList, isLoading, isEditing, onSend }: ChatInputProps) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_CARACTERES = 1000;

  const [mentionState, setMentionState] = useState({ isVisible: false, filter: "", startIndex: -1 });

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);

    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursorPosition);
    const words = textBeforeCursor.split(/(\s+)/); 
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      setMentionState({
        isVisible: true,
        filter: lastWord.slice(1).toLowerCase(),
        startIndex: cursorPosition - lastWord.length
      });
    } else {
      setMentionState(prev => prev.isVisible ? { ...prev, isVisible: false } : prev);
    }
  };

  const insertMention = (userName: string) => {
    const firstNameMatch = userName.match(/^[^\s]+/);
    const firstName = firstNameMatch ? firstNameMatch[0] : userName;

    const beforeMention = text.slice(0, mentionState.startIndex);
    const afterMention = text.slice(mentionState.startIndex + mentionState.filter.length + 1);
    
    setText(`${beforeMention}@${firstName} ${afterMention}`);
    setMentionState({ isVisible: false, filter: "", startIndex: -1 });
    
    setTimeout(() => {
        const input = document.getElementById('chat-input');
        if(input) input.focus();
    }, 10);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (selectedFile) {
      handleNotification(
        "Atenção", 
        "Você já anexou um arquivo. Remova-o antes de colar uma nova imagem.", 
        "warning"
      );
      return; 
    }

    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const blob = items[i].getAsFile();
        if (blob) {
          setSelectedFile(new File([blob], `paste_${Date.now()}.png`, { type: blob.type }));
          break;
        }
      }
    }
  };

  const submitForm = async () => {
    const textClean = text.trim();
    if (!textClean && !selectedFile) return;
    if (textClean.length < 3) {
      handleNotification(
        "Atenção", 
        "O comentário deve ter pelo menos 3 caracteres.", 
        "warning"
      );
      document.getElementById('chat-input')?.focus();
      return;
    }

    const myId = String(localStorage.getItem('codUserGIPP'));
    const mentionedUsers = userList.filter(u => {
      if (!u.name || String(u.user_id) === myId) return false;
      const regex = new RegExp(`@${u.name.split(' ')[0]}( |$)`, 'i');
      return regex.test(textClean);
    });

    const success = await onSend(textClean, selectedFile, mentionedUsers);
    if (success) {
      setText("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-3 bg-white border-top" style={{ borderColor: '#f0f0f0' }}>
      {selectedFile && (
        <div className="badge mb-2 d-flex align-items-center p-2 rounded-pill bg-success animate__animated animate__bounceIn shadow-sm" style={{ width: 'fit-content' }}>
          <i className="fa-solid fa-paperclip me-2 text-white"></i>
          <span className="small fw-normal text-truncate text-white" style={{ maxWidth: '150px' }}>{selectedFile.name}</span>
          <i className="fa-solid fa-circle-xmark ms-2 cursor-pointer text-white" onClick={() => setSelectedFile(null)}></i>
        </div>
      )}
      
      <div className="d-flex align-items-center">
        <button disabled={!!selectedFile || isLoading || isEditing} className="btn btn-light rounded-circle me-2 border-0 shadow-sm d-flex justify-content-center align-items-center flex-shrink-0" style={{ width: '40px', height: '40px' }} onClick={() => fileInputRef.current?.click()}>
          <i className="fa fa-solid fa-paperclip" style={{ color: '#6b7280' }}></i>
        </button>
        <input type="file" ref={fileInputRef} className="d-none" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
        
        <div className="flex-grow-1 rounded-pill px-3 py-1 d-flex align-items-center position-relative" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
          
          {/* Caixa flutuante de menção */}
          {mentionState.isVisible && (
            <div className="position-absolute shadow-lg rounded bg-white overflow-hidden animate__animated animate__fadeIn" style={{ bottom: '120%', left: '10px', zIndex: 3000, maxHeight: '200px', overflowY: 'auto', width: '250px', border: '1px solid #e0e0e0' }}>
              {userList?.filter(u => u.name && u.name.toLowerCase().includes(mentionState.filter)).length > 0 ? (
                userList.filter(u => u.name && u.name.toLowerCase().includes(mentionState.filter)).map(u => (
                  <div key={u.user_id} className="p-2 border-bottom d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={() => insertMention(u.name)}>
                    <img src={u.photo ? convertImage(u.photo) : imageUser} alt={u.name} className="rounded-circle me-2 border shadow-sm" style={{width: '28px', height: '28px', objectFit: 'cover'}} />
                    <span className="small fw-medium text-dark text-truncate">{u.name}</span>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center small text-muted">Nenhum usuário encontrado.</div>
              )}
            </div>
          )}

          <input
            id="chat-input"
            type="text"
            maxLength={MAX_CARACTERES}
            className="form-control border-0 bg-transparent shadow-none small p-2"
            placeholder={isEditing ? "Editando mensagem..." : "Digite sua mensagem"}
            value={text}
            disabled={isLoading || isEditing }
            onChange={handleTextChange}
            onKeyDown={(e) => e.key === 'Enter' && submitForm()}
            onPaste={handlePaste}
          />
          <small className={`${text.length == MAX_CARACTERES ? 'text-danger' : ''}`}>{text.length}/{MAX_CARACTERES}</small>
        </div>
        <button className="btn btn-success rounded-circle ms-2 shadow-sm d-flex justify-content-center align-items-center flex-shrink-0" style={{ width: '45px', height: '45px', backgroundColor: '#198754' }} onClick={submitForm} disabled={(!text.trim() && !selectedFile) || isLoading || isEditing || text.length < 3}>
          {isLoading ? <span className="spinner-border spinner-border-sm"></span> : <i className="fa fa-solid fa-paper-plane text-white" style={{ marginLeft: '-2px' }}></i>}
        </button>
      </div>
    </div>
  );
}