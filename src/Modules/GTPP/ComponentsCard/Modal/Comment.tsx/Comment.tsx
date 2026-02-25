import React, { useState } from 'react';
import { convertTime } from '../../../../../Util/Util';

interface CommentItemProps {
  item: any;
  isMe: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  userPhoto: string;
  userName: string;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  deleteComment: (id: number) => void;
  handleSaveEdit: (id: number, text: string) => Promise<void>;
  DownloadFile: (params: any) => void;
}

export default function CommentItem({ item, isMe, isAdmin, canEdit, userPhoto, userName, editingId, setEditingId, deleteComment, handleSaveEdit, DownloadFile }: CommentItemProps) {
  const [tempText, setTempText] = useState("");

  // Função para pintar a menção de Azul Claro e Negrito (apenas o primeiro nome)
  const renderComment = (commentText: string) => {
    if (!commentText) return null;
    const parts = commentText.split(/(@\w+)/g);

    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const fullMention = part.substring(1); 
        const firstName = fullMention.split(' ')[0]; 
        return (
          <span key={index} style={{ color: '#00d2ff', fontWeight: 'bold' }}>
            @{firstName}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={`d-flex mb-3 align-items-end animate__animated animate__fadeIn ${isMe ? 'flex-row-reverse' : ''}`}>
      <img src={userPhoto} alt={userName} className={`rounded-circle border border-white shadow-sm ${isMe ? 'ms-2' : 'me-2'}`} style={{ width: '38px', height: '38px', objectFit: 'cover', flexShrink: 0 }} />
      <div className={`d-flex flex-column overflow-hidden ${isMe ? 'align-items-end' : 'align-items-start'}`} style={{ maxWidth: '80%', width: editingId === item.id ? '100%' : 'auto' }}>
        <div className="p-2 px-3 shadow-sm" style={{ backgroundColor: '#2b2d42', borderRadius: isMe ? '20px 20px 2px 20px' : '20px 20px 20px 2px', border: '1px solid rgba(0,0,0,0.1)', width: '100%' }}>
          
          <div className='d-flex align-items-center justify-content-between mb-1 gap-3'>
            <span className="fw-bold small text-truncate" style={{ color: '#00d26a' }}>{isMe ? `Você` : userName}</span>
            <div className="d-flex gap-2">
              {/* {isMe && !editingId && canEdit && (
                <i onClick={() => { setEditingId(item.id); setTempText(item.comment); }} className='fa-solid fa-pen fa-xs text-warning opacity-75 cursor-pointer' title="Editar (até 10 min)"></i>
              )} */}
              {(isMe || isAdmin) && !editingId && (
                <i onClick={() => deleteComment(item.id)} className='fa fa-solid fa-trash fa-xs text-danger opacity-75 cursor-pointer' title="Excluir"></i>
              )}
            </div>
          </div>

          {editingId === item.id ? (
            <div className="d-flex flex-column gap-2 mt-2">
                <textarea 
                    className="form-control form-control-sm border-secondary text-white"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', resize: 'none', minHeight: '60px', fontSize: '0.9rem' }}
                    value={tempText}
                    onChange={(e) => setTempText(e.target.value)}
                    autoFocus
                />
                <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-sm btn-outline-light py-0" style={{fontSize: '0.75rem'}} onClick={() => setEditingId(null)}>Cancelar</button>
                    <button className="btn btn-sm btn-success py-0" style={{fontSize: '0.75rem'}} onClick={() => handleSaveEdit(item.id, tempText)}>Salvar</button>
                </div>
            </div>
          ) : (
            <React.Fragment>
              <span className="small text-white" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.9rem', lineHeight: '1.4' }}>
                {renderComment(item.comment)}
              </span>
              {item.updated_at && item.updated_at !== item.created_at && (
                <small className="text-muted d-block mt-1" style={{ fontSize: '0.65rem' }}>(editado)</small>
              )}
            </React.Fragment>
          )}

          {item.file && item.file.file_name && (
            <div className="mt-2 p-2 rounded-3 d-flex align-items-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <span className="small fw-bold text-white text-truncate" style={{ maxWidth: '140px' }}>{item.file.file_name}</span>
              <button className="btn btn-sm ms-2" onClick={() => DownloadFile({method: 'GET', params: null,pathFile:'GTPP/Handlers/TaskItemResponse.php',urlComplement:`&id_comment=${item.id}`})}>
                <i className="fa-solid fa-download fs-5 text-success"></i>
              </button>
            </div>
          )}
        </div>
        <small className="text-muted mt-1 px-1" style={{ fontSize: '0.65rem' }}>{convertTime(item.created_at)}</small>
      </div>
    </div>
  );
}