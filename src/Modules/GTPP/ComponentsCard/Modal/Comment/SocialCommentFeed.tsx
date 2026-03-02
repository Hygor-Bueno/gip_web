import React, { useState, useRef, useEffect } from 'react';
import { useConnection } from '../../../../../Context/ConnContext';
import { convertImage } from '../../../../../Util/Util';
import imageUser from "../../../../../Assets/Image/user.png";
import { useWebSocket } from '../../../Context/GtppWsContext';
import ChatInput from './ChatInput';     // Ajuste o caminho se necessário
import CommentItem from './Comment';

interface CommentProps {
  userList: any[];
  editTask: { id: number, task_id: number, description: string };
  onClose?: any;
}

export default function SocialCommentFeed({ userList, editTask, onClose }: CommentProps) {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isOnline, setIsOnline] = useState(navigator.onLine); 
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const { comment, deleteComment, sendComment, getComment, editComment, notifyMentionWs } = useWebSocket() as any;
  const { DownloadFile } = useConnection();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30000); 
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (editTask?.id) getComment(editTask.id);
  }, [editTask?.id, getComment]);

  useEffect(() => {
    if (isAtBottom) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comment.data, isAtBottom]);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const isBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    setIsAtBottom(isBottom);
  };

  // Centralizando a lógica de Envio (Recebe os dados do filho ChatInput)
  const handleSendOrchestrator = async (text: string, file: File | null, mentionedUsers: any[]): Promise<boolean> => {
    if (!isOnline) return false;
    setIsLoading(true);
    try {
      const res = await sendComment(text, file, editTask.id, editTask.task_id);
      if (res && !res.error) {
        if (mentionedUsers.length > 0 && notifyMentionWs) {
          notifyMentionWs(mentionedUsers, editTask.task_id, editTask.description);
        }
        return true; // Sucesso, o Input vai limpar o texto
      }
      return false;
    } catch (error) {
      console.error("Erro no envio:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEditOrchestrator = async (id: number, newText: string) => {
    setIsLoading(true);
    try {
      if (editComment) await editComment(id, newText, editTask.id, editTask.task_id);
      setEditingId(null);
    } catch (error) {
      console.error("Erro ao editar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrchestrator = (id: number) => {
    deleteComment(id, editTask.id, editTask.task_id);
  };

  return (
    <div 
      className={`d-flex flex-column shadow-lg animate__animated ${isMobile ? 'animate__fadeInUp' : 'animate__fadeInRight'}`} 
      style={{ height: isMobile ? '100dvh' : 'calc(100% - 34px)', width: isMobile ? '100%' : '450px', zIndex: 2000, left: isMobile ? '0' : '20px', top: isMobile ? '0' : '4vh', position: 'fixed', backgroundColor: '#fafafafa', borderRadius: isMobile ? '0' : '20px', border: '1px solid #e0e0e0', overflow: 'hidden' }}
    >
      {!isOnline && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 4000 }}>
          <div className="spinner-grow text-danger" role="status"></div>
          <h6 className="mt-3 fw-bold text-danger">Sem conexão</h6>
        </div>
      )}

      {/* Header */}
      <div className="p-3 d-flex justify-content-between align-items-center bg-white border-bottom">
        <div className="overflow-hidden pe-2">
          <h6 className="m-0 fw-bold"><i className="fa-solid fa-comments me-2 text-success"></i> Comentários</h6>
          <small className='m-0 fw-bold text-secondary text-truncate d-block'>Item: {editTask.description}</small>
        </div>
        <button className="btn btn-sm btn-light border-0 rounded-circle" onClick={onClose}><i className="fa-solid fa-xmark fs-5 text-danger"></i></button>
      </div>

      {/* Área do Chat (Mapeia a Lista de Componentes Filhos) */}
      <div ref={chatContainerRef} onScroll={handleScroll} className="flex-grow-1 p-3 overflow-auto" style={{ backgroundColor: '#f8f9fa' }}>
        {comment.data && comment.data.length > 0 ? (
          comment.data.map((item: any) => {
            const userData = userList?.find((u: any) => Number(u.user_id) === Number(item.user.id));
            const userPhoto = userData?.photo ? convertImage(userData.photo) : imageUser;
            const userName = userData?.name || item.user.name;
            const isMe = localStorage.getItem('codUserGIPP') == item.user.id;
            const canEdit = (currentTime - new Date(item.created_at).getTime()) < (10 * 60 * 1000); 
            const isAdmin = localStorage.getItem('ADM') == '1';
            
            return item.status == 1 && (
              <CommentItem 
                key={item.id}
                item={item}
                isMe={isMe}
                isAdmin={isAdmin}
                canEdit={canEdit}
                userPhoto={userPhoto}
                userName={userName}
                editingId={editingId}
                setEditingId={setEditingId}
                deleteComment={handleDeleteOrchestrator}
                handleSaveEdit={handleSaveEditOrchestrator}
                DownloadFile={DownloadFile}
              />
            );
          })
        ) : (
          <div className="text-center mt-5 text-muted"><i className="fa-regular fa-comments fs-1 mb-2 opacity-25"></i><br/>Nenhum comentário.</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Componente Filho de Digitação */}
      <ChatInput 
        userList={userList}
        isLoading={isLoading}
        isEditing={editingId !== null}
        onSend={handleSendOrchestrator}
      />

      {/* Botão Flutuante de Rolar para Baixo */}
      {!isAtBottom && (
        <button onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })} style={{ position: "absolute", bottom: "90px", right: "20px", borderRadius: "50%", width: "45px", height: "45px", zIndex: 10 }} className="btn btn-success shadow">
          <i className="fa-solid fa-arrow-down text-white"></i>
        </button>
      )}
    </div>
  );
}