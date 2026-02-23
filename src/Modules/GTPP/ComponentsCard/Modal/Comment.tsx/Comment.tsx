import { useState, useRef, useEffect } from 'react';
import { useConnection } from '../../../../../Context/ConnContext';
import { convertImage, convertTime } from '../../../../../Util/Util';
import imageUser from "../../../../../Assets/Image/user.png";
import { useWebSocket } from '../../../Context/GtppWsContext';

interface CommentProps {
  userList: any[];
  editTask: { id: number, task_id: number };
  onClose?: any;
}

export default function SocialCommentFeed({ userList, editTask, onClose }: CommentProps) {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Controle de rede real
  const [isLoading, setIsLoading] = useState(false);

  const MAX_CARACTERES = 1000;

  const { comment, deleteComment, sendComment, getComment } = useWebSocket();
  const { DownloadFile } = useConnection();

  // Monitor de conexão (Online/Offline)
  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  // Monitor de velocidade da conexão
  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      const updateConnection = () => {
        const type = connection.effectiveType;
        setConnectionType(type);
        setIsSlowConnection(["slow-2g", "2g", "3g"].includes(type));
      };
      updateConnection();
      connection.addEventListener("change", updateConnection);
      return () => connection.removeEventListener("change", updateConnection);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (editTask?.id) getComment(editTask.id);
  }, [editTask?.id, getComment]);

  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comment.data]);

  const handleSend = async () => {
    const textClean = text.trim();
    
    // CORREÇÃO 1: Permite enviar se tiver texto OU se tiver arquivo
    if (!textClean && !selectedFile) return;
    
    // CORREÇÃO 2: Bloqueia se estiver offline
    if (!isOnline) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await sendComment(textClean, selectedFile, editTask.id, editTask.task_id);

      if (res && !res.error) {
        setText("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        console.warn('new Error');
      }
    } catch (error) {
      console.error("Erro no envio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;
    const threshold = 50; 
    const isBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    setIsAtBottom(isBottom);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const blob = items[i].getAsFile();
        if (blob) {
          setSelectedFile(new File([blob], `paste_${Date.now()}.png`, { type: blob.type }));
        }
      }
    }
  };

  return (
    <div 
      className={`d-flex flex-column shadow-lg animate__animated ${isMobile ? 'animate__fadeInUp' : 'animate__fadeInRight'}`} 
      style={{ 
        height: isMobile ? '100dvh' : '500px', 
        width: isMobile ? '100%' : '450px',
        zIndex: 2000, 
        left: isMobile ? '0' : '20px', 
        top: isMobile ? '0' : '20vh',
        position: 'fixed',
        backgroundColor: '#fafafafa',
        borderRadius: isMobile ? '0' : '20px',
        border: '1px solid #e0e0e0',
        overflow: 'hidden'
      }}
    >
      {/* CORREÇÃO 3: Overlay de Offline (Resiliência) */}
      {!isOnline && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(255,255,255,0.9)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 4000, backdropFilter: "blur(4px)"
        }}>
          <div className="spinner-grow text-danger" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <h6 className="mt-3 fw-bold text-danger">Sem conexão</h6>
          <small className="text-muted text-center px-3">Verifique seu Wi-Fi ou dados móveis.</small>
        </div>
      )}

      {/* CORREÇÃO 4: Loading agora renderiza DENTRO do componente */}
      {isLoading && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          zIndex: 3000, backdropFilter: "blur(3px)"
        }}>
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          {isSlowConnection && <small className="mt-2 text-dark">Conexão lenta detectada...</small>}
        </div>
      )}

      {/* Header */}
      <div className="p-3 d-flex justify-content-between align-items-center bg-white border-bottom" style={{ borderColor: '#f0f0f0' }}>
        <h6 className="m-0 fw-bold" style={{ color: '#333' }}>
          <i className="fa-solid fa-comments me-2" style={{ color: '#198754' }}></i>
          Comentários
        </h6>
        <button className="btn btn-sm btn-light border-0 rounded-circle shadow-sm" style={{ width: '32px', height: '32px' }} onClick={onClose}>
          <i className="fa-solid fa-xmark fs-5 text-danger"></i>
        </button>
      </div>

      {/* Chat Area */}
      <div ref={chatContainerRef} onScroll={handleScroll} className="flex-grow-1 p-3 overflow-auto custom-scrollbar" style={{ backgroundColor: '#f8f9fa' }}>
        {comment.data && comment.data.length > 0 ? (
          comment.data.map((item: any) => {
            const userData = userList?.find((u: any) => Number(u.user_id) === Number(item.user.id));
            const userPhoto = userData?.photo ? convertImage(userData.photo) : imageUser;
            const userName = userData?.name || item.user.name;
            const isMe = localStorage.getItem('codUserGIPP') == item.user.id;
            
            return item.status == 1 && (
              <div key={item.id} className={`d-flex mb-3 align-items-end animate__animated animate__fadeIn ${isMe ? 'flex-row-reverse' : ''}`}>
                <img src={userPhoto} alt={userName} className={`rounded-circle border border-white shadow-sm ${isMe ? 'ms-2' : 'me-2'}`} style={{ width: '38px', height: '38px', objectFit: 'cover' }} />
                <div className={`d-flex flex-column overflow-hidden ${isMe ? 'align-items-end' : 'align-items-start'}`} style={{ maxWidth: '80%' }}>
                  <div className="p-2 px-3 shadow-sm" style={{ backgroundColor: '#2b2d42', borderRadius: isMe ? '20px 20px 2px 20px' : '20px 20px 20px 2px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <div className='d-flex align-items-center justify-content-between mb-1 gap-3'>
                      <span className="fw-bold small text-truncate" style={{ color: '#00d26a' }}>{isMe ? `Você` : userName}</span>
                      {isMe && <i onClick={() => deleteComment(item.id, editTask.id, editTask.task_id)} className='fa fa-solid fa-trash fa-xs text-danger opacity-75 cursor-pointer'></i>}
                    </div>
                    <span className="small text-white" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.9rem', lineHeight: '1.4' }}>{item.comment}</span>
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
          })
        ) : (
          /* CORREÇÃO 5: Spinner de carregamento em vez de texto vazio */
          <div className="text-center mt-5 d-flex flex-column align-items-center animate__animated animate__fadeIn">
            <div className="spinner-border text-success opacity-25 mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}></div>
            <span className="small fw-medium text-muted">Carregando conversas...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer / Input */}
      <div className="p-3 bg-white border-top" style={{ borderColor: '#f0f0f0' }}>
        {selectedFile && (
          <div className="badge mb-2 d-flex align-items-center p-2 rounded-pill bg-success animate__animated animate__bounceIn shadow-sm" style={{ width: 'fit-content' }}>
            <i className="fa-solid fa-paperclip me-2 text-white"></i>
            <span className="small fw-normal text-truncate text-white" style={{ maxWidth: '150px' }}>{selectedFile.name}</span>
            <i className="fa-solid fa-circle-xmark ms-2 cursor-pointer text-white" onClick={() => setSelectedFile(null)}></i>
          </div>
        )}
        <div className="d-flex align-items-center">
          <button disabled={!!selectedFile || isLoading} className="btn btn-light rounded-circle me-2 border-0 shadow-sm d-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px' }} onClick={() => fileInputRef.current?.click()}>
            <i className="fa fa-solid fa-paperclip" style={{ color: '#6b7280' }}></i>
          </button>
          <input type="file" ref={fileInputRef} className="d-none" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          
          <div className="flex-grow-1 rounded-pill px-3 py-1 d-flex align-items-center" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
            <input
              type="text"
              maxLength={MAX_CARACTERES}
              className="form-control border-0 bg-transparent shadow-none small p-2"
              placeholder="Digite sua mensagem..."
              value={text}
              disabled={isLoading}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              onPaste={handlePaste}
            />
          </div>
          <button 
            className="btn btn-success rounded-circle ms-2 shadow-sm d-flex justify-content-center align-items-center" 
            style={{ width: '45px', height: '45px', backgroundColor: '#198754' }} 
            onClick={handleSend} 
            disabled={(!text.trim() && !selectedFile) || isLoading}
          >
            {isLoading ? 
              <span className="spinner-border spinner-border-sm"></span> : 
              <i className="fa fa-solid fa-paper-plane text-white" style={{ marginLeft: '-2px' }}></i>
            }
          </button>
        </div>

        {!isAtBottom && (
          <button
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            style={{ position: "absolute", bottom: "90px", right: "20px", borderRadius: "50%", width: "45px", height: "45px", zIndex: 10 }}
            className="btn btn-success shadow"
          >
            <i className="fa-solid fa-arrow-down text-white"></i>
          </button>
        )}
      </div>
    </div>
  );
}