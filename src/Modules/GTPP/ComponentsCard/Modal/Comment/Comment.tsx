import React from 'react';
import { convertTime, downloadFile } from '../../../../../Util/Utils';

interface CommentItemProps {
  item: any;
  isMe: boolean;
  isAdmin: boolean;
  userPhoto: string;
  userName: string;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  deleteComment: (id: number) => void;
  handleSaveEdit: (id: number, text: string) => Promise<void>;
}

export default function CommentItem({ item, isMe, isAdmin, userPhoto, userName, editingId, deleteComment }: CommentItemProps) {
  return (
    <div className={`d-flex mb-3 align-items-end animate__animated animate__fadeIn ${isMe ? 'flex-row-reverse' : ''}`}>
      <img src={userPhoto} alt={userName} className={`rounded-circle border border-white shadow-sm ${isMe ? 'ms-2' : 'me-2'}`} style={{ width: '38px', height: '38px', objectFit: 'cover', flexShrink: 0 }} />
      <div className={`d-flex flex-column overflow-hidden ${isMe ? 'align-items-end' : 'align-items-start'}`} style={{ maxWidth: '80%', width: editingId === item.id ? '100%' : 'auto' }}>
        <div className="p-2 px-3 shadow-sm" style={{ backgroundColor: '#2b2d42', borderRadius: isMe ? '20px 20px 2px 20px' : '20px 20px 20px 2px', border: '1px solid rgba(0,0,0,0.1)', width: '100%' }}>
          
          <div className='d-flex align-items-center justify-content-between mb-1 gap-3'>
            <span className="fw-bold small text-truncate" style={{ color: '#00d26a' }}>{isMe ? `Você` : userName}</span>
            <div className="d-flex gap-2">
              {(isMe || isAdmin) && !editingId && (
                <i onClick={() => deleteComment(item.id)} className='fa fa-solid fa-trash fa-xs text-danger opacity-75 cursor-pointer' title="Excluir"></i>
              )}
            </div>
          </div>

          <React.Fragment>
            <span className="small text-white" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.9rem', lineHeight: '1.4' }}>
              {item.comment}
            </span>
            {item.updated_at && item.updated_at !== item.created_at && (
              <small className="text-muted d-block mt-1" style={{ fontSize: '0.65rem' }}>(editado)</small>
            )}
          </React.Fragment>

          {item.file && item.file.file_name && (
            <div className="mt-2 p-2 rounded-3 d-flex align-items-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <span className="small fw-bold text-white text-truncate" style={{ maxWidth: '140px' }}>{item.file.file_name}</span>
              <button className="btn btn-sm ms-2" onClick={() => downloadFile({method: 'GET', params: null, pathFile:'GTPP/Handlers/TaskItemResponse.php', urlComplement:`&id_comment=${item.id}`})}>
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