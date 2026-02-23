import React, { useState, useRef, useEffect } from 'react';
import { useConnection } from '../../../../../Context/ConnContext';
import { convertImage } from '../../../../../Util/Util';
import imageUser from "../../../../../Assets/Image/user.png";
import { useWebSocket } from '../../../Context/GtppWsContext';

interface CommentProps {
  userList: any[];
  editTask: { id: number, task_id: number };
  onClose?: any;
}

export default function SocialCommentFeed({ userList, editTask, onClose }: CommentProps) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { comment, deleteComment, sendComment, getComment } = useWebSocket();
  const { DownloadFile } = useConnection();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (editTask?.id) {
      getComment(editTask.id);
    }
  }, [editTask?.id, getComment]);

  const handleSend = async () => {
    if (!text.trim() && !selectedFile) return;

    const res = await sendComment(text, selectedFile, editTask.id, editTask.task_id);

    if (res && !res.error) {
        setText("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div 
      className={`d-flex flex-column shadow-lg animate__animated ${isMobile ? 'animate__fadeInUp' : 'animate__fadeInRight'}`} 
      style={{ 
        height: isMobile ? '100dvh' : '500px', 
        width: isMobile ? '100%' : '380px',
        zIndex: 2000, 
        left: isMobile ? '0' : '20px', 
        top: isMobile ? '0' : '20vh',
        position: 'fixed',
        backgroundColor: '#fafafafa', // Fundo Principal Branco
        borderRadius: isMobile ? '0' : '20px',
        border: '1px solid #e0e0e0', // Borda leve para destacar do fundo do sistema
        overflow: 'hidden'
      }}
    >
      {/* Header Branco e Clean */}
      <div className="p-3 d-flex justify-content-between align-items-center bg-white border-bottom" style={{ borderColor: '#f0f0f0' }}>
        <h6 className="m-0 fw-bold" style={{ color: '#333' }}>
          <i className="fa-solid fa-comments me-2" style={{ color: '#198754' }}></i>
          Comentários
        </h6>
        <button 
          className="btn btn-sm btn-light border-0 rounded-circle shadow-sm d-flex align-items-center justify-content-center" 
          style={{ width: '32px', height: '32px' }}
          onClick={onClose}
          title="Fechar"
        >
          {/* O X Vermelho que você pediu */}
          <i className="fa-solid fa-xmark fs-5 text-danger"></i>
        </button>
      </div>

      {/* Listagem de Comentários (Fundo levemente cinza para os balões destacarem) */}
      <div className="flex-grow-1 p-3 overflow-auto custom-scrollbar" style={{ backgroundColor: '#f8f9fa' }}>
        {comment.data && comment.data.length > 0 ? (
          comment.data.map((item: any) => {
            const userData = userList?.find((u: any) => Number(u.user_id) === Number(item.user.id));
            const userPhoto = userData?.photo ? convertImage(userData.photo) : imageUser;
            const userName = userData?.name || item.user.name;
            const isMe = localStorage.getItem('codUserGIPP') == item.user.id;

            return item.status == 1 && (
              <div 
                key={item.id} 
                className={`d-flex mb-3 align-items-end animate__animated animate__fadeIn ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {/* Foto do Usuário */}
                <img
                  src={userPhoto}
                  alt={userName}
                  className={`rounded-circle border border-white shadow-sm ${isMe ? 'ms-2' : 'me-2'}`}
                  style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                />

                {/* Balão da Mensagem (Fundo Escuro para o Texto Branco e Nome Verde brilharem) */}
                <div className={`d-flex flex-column overflow-hidden ${isMe ? 'align-items-end' : 'align-items-start'}`} style={{ maxWidth: '80%' }}>
                  <div 
                    className="p-2 px-3 shadow-sm" 
                    style={{ 
                      backgroundColor: '#2b2d42', // Tom escuro moderno para os balões
                      borderRadius: isMe ? '20px 20px 2px 20px' : '20px 20px 20px 2px', // Estilo gota de app de chat
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}
                  >
                    <div className='d-flex align-items-center justify-content-between mb-1 gap-3'>
                      {/* Nome das Pessoas Verde */}
                      <span className="fw-bold small text-truncate" style={{ color: '#00d26a', letterSpacing: '0.3px' }}>
                        {isMe ? `Você` : userName}
                      </span>
                      
                      {isMe && (
                        <i onClick={() => deleteComment(item.id, editTask.id, editTask.task_id)} 
                          className='fa fa-solid fa-trash fa-xs text-danger opacity-75 p-1 cursor-pointer'
                          title="Apagar"
                        ></i>
                      )}
                    </div>

                    {/* Texto Branco */}
                    <span className="small text-white" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.4' }}>
                      {item.comment}
                    </span>
                    
                    {/* Anexo */}
                    {item.file && item.file.file_name && (
                      <div className="mt-2 p-2 rounded-3 d-flex align-items-center overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <div className="d-flex flex-column overflow-hidden flex-grow-1">
                          <span className="small fw-bold text-truncate text-white" style={{ maxWidth: '140px' }}>{item.file.file_name}</span>
                        </div>
                        <button className="btn btn-sm ms-2" style={{ color: '#00d26a' }} onClick={async () => {
                            await DownloadFile({
                                method: 'GET',
                                params: null,
                                pathFile: 'GTPP/Handlers/TaskItemResponse.php',
                                urlComplement: `&id_comment=${item.id}`
                            });
                          }}> 
                            <i className="fa-solid fa-download fs-5 text-success"></i>
                        </button>
                      </div>
                    )}
                  </div>
                  <small className="text-muted mt-1 px-1" style={{ fontSize: '0.65rem', fontWeight: '500' }}>{item.created_at}</small>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center mt-5 d-flex flex-column align-items-center">
            <i className="fa-regular fa-comments fs-1 mb-2" style={{ color: '#d1d5db' }}></i>
            <span className="small" style={{ color: '#9ca3af' }}>Nenhum comentário ainda.</span>
          </div>
        )}
      </div>

      {/* Input Area (Rodapé Branco) */}
      <div className="p-3 bg-white border-top" style={{ borderColor: '#f0f0f0' }}>
        {selectedFile && (
          <div className="badge mb-2 d-flex align-items-center p-2 rounded-pill animate__animated animate__bounceIn shadow-sm" style={{ backgroundColor: '#198754', width: 'fit-content' }}>
            <i className="fa-solid fa-paperclip me-2 text-white"></i>
            <span className="small fw-normal text-truncate text-white" style={{maxWidth: '150px'}}>{selectedFile.name}</span>
            <i className="fa-solid fa-circle-xmark ms-2 cursor-pointer text-white" onClick={() => setSelectedFile(null)}></i>
          </div>
        )}
        <div className="d-flex align-items-center">
          <button className="btn btn-light rounded-circle me-2 border-0 shadow-sm d-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px' }} onClick={() => fileInputRef.current?.click()}>
            <i className="fa fa-solid fa-paperclip" style={{ color: '#6b7280' }}></i>
          </button>
          <input type="file" ref={fileInputRef} className="d-none" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          
          <div className="flex-grow-1 rounded-pill px-3 py-1 d-flex align-items-center" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
            <input
              type="text"
              className="form-control border-0 bg-transparent shadow-none small p-2"
              style={{ color: '#1f2937' }}
              placeholder="Digite sua mensagem..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
          
          {/* Botão Enviar Verde com Avião Branco */}
          <button 
            className="btn btn-success rounded-circle ms-2 shadow-sm d-flex justify-content-center align-items-center" 
            style={{ width: '45px', height: '45px', backgroundColor: '#198754', borderColor: '#198754' }} 
            onClick={handleSend} 
            disabled={!text.trim() && !selectedFile}
          >
            <i className="fa fa-solid fa-paper-plane text-white" style={{ marginLeft: '-2px' }}></i>
          </button>
        </div>
      </div>
    </div>
  );
}