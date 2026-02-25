import React, { useState, useRef, useEffect } from 'react';
import { useConnection } from '../../../../../Context/ConnContext';
import { convertImage, convertTime, handleNotification } from '../../../../../Util/Util';
import imageUser from "../../../../../Assets/Image/user.png";
import { useWebSocket } from '../../../Context/GtppWsContext';

interface CommentProps {
  userList: any[];
  editTask: { id: number, task_id: number, description: string };
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
  const [isOnline, setIsOnline] = useState(navigator.onLine); 
  const [isLoading, setIsLoading] = useState(false);

  // --- ESTADOS PARA EDIÇÃO ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempText, setTempText] = useState("");
  
  // --- ESTADO DO RELÓGIO (Para o lápis sumir sozinho) ---
  const [currentTime, setCurrentTime] = useState(Date.now());

  // --- ESTADOS PARA MENÇÕES (@usuario) ---
  const [mentionState, setMentionState] = useState({
    isVisible: false,
    filter: "",
    startIndex: -1
  });

  const MAX_CARACTERES = 1000;

  // Contextos
  const { comment, deleteComment, sendComment, getComment, editComment, notifyMentionWs } = useWebSocket() as any;
  const { DownloadFile } = useConnection();

  // --- EFEITO DO RELÓGIO (A cada 30 segundos) ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000); 
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if(text.length == 950) {
      handleNotification("Atenção", "Voce vai Atigir o limite maximo de caracteres", "warning");
    }
  }, [text])

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

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
    if (!textClean && !selectedFile) return;
    if (!isOnline) return;

    setIsLoading(true);

    // --- 1. DETECTAR QUEM FOI MENCIONADO (Lógica Sênior) ---
    const myId = String(localStorage.getItem('codUserGIPP'));
    
    // Filtramos a lista para achar se o nome da pessoa está no texto com um @ antes
    const mentionedUsers = userList.filter(u => {
      if (!u.name || String(u.user_id) === myId) return false;
      
      // Regex garante que ele ache "@Maria" e não confunda com "@Mariazinha"
      const regex = new RegExp(`@${u.name}( |$)`, 'i');
      return regex.test(textClean);
    });

    try {
      const res = await sendComment(textClean, selectedFile, editTask.id, editTask.task_id);
      
      if (res && !res.error) {
        
        // --- 2. DISPARAR O AVISO PARA OS COLEGAS MENCIONADOS ---
        if (mentionedUsers.length > 0 && notifyMentionWs) {
          notifyMentionWs(mentionedUsers, editTask.task_id, editTask.description);
        }

        setText("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Erro no envio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNÇÃO PARA SALVAR A EDIÇÃO ---
  const handleSaveEdit = async (id: number) => {
    if (!tempText.trim()) return;
    setIsLoading(true);
    try {
      if (editComment) {
        await editComment(id, tempText, editTask.id, editTask.task_id);
      } else {
        console.warn("Implemente o editComment no seu Context!");
      }
      setEditingId(null);
      setTempText("");
    } catch (error) {
      console.error("Erro ao editar:", error);
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

  // --- LÓGICA DE MENÇÕES ---
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
    const beforeMention = text.slice(0, mentionState.startIndex);
    const afterMention = text.slice(mentionState.startIndex + mentionState.filter.length + 1);
    const newText = `${beforeMention}@${userName} ${afterMention}`;
    
    setText(newText);
    setMentionState({ isVisible: false, filter: "", startIndex: -1 });
    
    // Devolve o foco para o input após a seleção (opcional, melhora a UX)
    setTimeout(() => {
        const input = document.getElementById('chat-input');
        if(input) input.focus();
    }, 10);
  };

  return (
    <div 
      className={`d-flex flex-column shadow-lg animate__animated ${isMobile ? 'animate__fadeInUp' : 'animate__fadeInRight'}`} 
      style={{ 
        height: isMobile ? '100dvh' : 'calc(100% - 34px)', 
        width: isMobile ? '100%' : '450px',
        zIndex: 2000, 
        left: isMobile ? '0' : '20px', 
        top: isMobile ? '0' : '4vh',
        position: 'fixed',
        backgroundColor: '#fafafafa',
        borderRadius: isMobile ? '0' : '20px',
        border: '1px solid #e0e0e0',
        overflow: 'hidden'
      }}
    >
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

      {isLoading && isOnline && (
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
        <div className="overflow-hidden pe-2">
          <h6 className="m-0 fw-bold d-flex align-items-center" style={{ color: '#333' }}>
            <i className="fa-solid fa-comments me-2" style={{ color: '#198754' }}></i>
            Comentários
          </h6>
          <small className='m-0 fw-bold text-secondary text-truncate d-block' title={editTask.description}>
            Item: {editTask.description}
          </small>
        </div>
        <button className="btn btn-sm btn-light border-0 rounded-circle shadow-sm flex-shrink-0" style={{ width: '32px', height: '32px' }} onClick={onClose}>
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
            
            // --- LÓGICA DE TEMPO DINÂMICA PARA EDIÇÃO ---
            const isMe = localStorage.getItem('codUserGIPP') == item.user.id;
            const createdAtTime = new Date(item.created_at).getTime();
            // Permite edição apenas se a mensagem tiver menos de 10 minutos
            const canEdit = (currentTime - createdAtTime) < (10 * 60 * 1000); 
            const isAdmin = localStorage.getItem('ADM') == '1';
            
            return item.status == 1 && (
              <div key={item.id} className={`d-flex mb-3 align-items-end animate__animated animate__fadeIn ${isMe ? 'flex-row-reverse' : ''}`}>
                <img src={userPhoto} alt={userName} className={`rounded-circle border border-white shadow-sm ${isMe ? 'ms-2' : 'me-2'}`} style={{ width: '38px', height: '38px', objectFit: 'cover', flexShrink: 0 }} />
                <div className={`d-flex flex-column overflow-hidden ${isMe ? 'align-items-end' : 'align-items-start'}`} style={{ maxWidth: '80%', width: editingId === item.id ? '100%' : 'auto' }}>
                  <div className="p-2 px-3 shadow-sm" style={{ backgroundColor: '#2b2d42', borderRadius: isMe ? '20px 20px 2px 20px' : '20px 20px 20px 2px', border: '1px solid rgba(0,0,0,0.1)', width: '100%' }}>
                    <div className='d-flex align-items-center justify-content-between mb-1 gap-3'>
                      <span className="fw-bold small text-truncate" style={{ color: '#00d26a' }}>{isMe ? `Você` : userName}</span>
                      
                      {/* Botoes de Ação */}
                      <div className="d-flex gap-2">
                        {isMe && !editingId && canEdit && (
                          <i onClick={() => { setEditingId(item.id); setTempText(item.comment); }} className='fa-solid fa-pen fa-xs text-warning opacity-75 cursor-pointer' title="Editar (até 10 min)"></i>
                        )}
                        {(isMe || isAdmin) && !editingId && (
                          <i onClick={() => deleteComment(item.id, editTask.id, editTask.task_id)} className='fa fa-solid fa-trash fa-xs text-danger opacity-75 cursor-pointer' title="Excluir"></i>
                        )}
                      </div>
                    </div>

                    {/* Bloco de Edição vs Exibição */}
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
                              <button className="btn btn-sm btn-success py-0" style={{fontSize: '0.75rem'}} onClick={() => handleSaveEdit(item.id)}>Salvar</button>
                          </div>
                      </div>
                    ) : (
                      <>
                      <span className="small text-white" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.9rem', lineHeight: '1.4' }}>
                        {item.comment}
                      </span>
                      {item.updated_at && item.updated_at !== item.created_at && (
                        <small className="text-muted d-block mt-1" style={{ fontSize: '0.65rem' }}>(editado)</small>
                      )}
                    </>
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
          })
        ) : (
          <div className="text-center mt-5 d-flex flex-column align-items-center animate__animated animate__fadeIn">
             {!isOnline ? (
               <>
                 <div className="spinner-border text-success opacity-50 mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}></div>
                 <span className="small fw-medium" style={{ color: '#9ca3af' }}>Carregando conversas...</span>
               </>
             ) : (
               <>
                 <i className="fa-regular fa-comments fs-1 mb-2 text-muted opacity-25"></i>
                 <span className="small text-muted">Nenhum comentário ainda.</span>
               </>
             )}
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
          <button disabled={!!selectedFile || isLoading || editingId !== null} className="btn btn-light rounded-circle me-2 border-0 shadow-sm d-flex justify-content-center align-items-center flex-shrink-0" style={{ width: '40px', height: '40px' }} onClick={() => fileInputRef.current?.click()}>
            <i className="fa fa-solid fa-paperclip" style={{ color: '#6b7280' }}></i>
          </button>
          <input type="file" ref={fileInputRef} className="d-none" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          
          <div className="flex-grow-1 rounded-pill px-3 py-1 d-flex align-items-center position-relative" style={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' }}>
            
            {/* --- CAIXINHA DE MENÇÕES FLUTUANTE --- */}
            {mentionState.isVisible && (
              <div 
                className="position-absolute shadow-lg rounded bg-white overflow-hidden animate__animated animate__fadeIn" 
                style={{ 
                  bottom: '120%', left: '10px', zIndex: 3000, 
                  maxHeight: '200px', overflowY: 'auto', width: '250px', 
                  border: '1px solid #e0e0e0' 
                }}
              >
                {userList?.filter(u => u.name && u.name.toLowerCase().includes(mentionState.filter)).length > 0 ? (
                  userList.filter(u => u.name && u.name.toLowerCase().includes(mentionState.filter)).map(u => (
                    <div 
                      key={u.user_id} 
                      className="p-2 border-bottom d-flex align-items-center" 
                      style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => insertMention(u.name)}
                    >
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
              placeholder={editingId ? "Editando mensagem..." : "Digite sua mensagem"}
              value={text}
              disabled={isLoading || editingId !== null}
              onChange={handleTextChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              onPaste={handlePaste}
            />
          </div>
          <button 
            className="btn btn-success rounded-circle ms-2 shadow-sm d-flex justify-content-center align-items-center flex-shrink-0" 
            style={{ width: '45px', height: '45px', backgroundColor: '#198754' }} 
            onClick={handleSend} 
            disabled={(!text.trim() && !selectedFile) || isLoading || editingId !== null}
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