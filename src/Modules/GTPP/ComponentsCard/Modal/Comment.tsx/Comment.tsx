import React, { useState, useRef, useEffect } from 'react';
import { useConnection } from '../../../../../Context/ConnContext';
import { convertImage, handleNotification } from '../../../../../Util/Util'; // Importe sua função de conversão
import imageUser from "../../../../../Assets/Image/user.png"; // Fallback caso não ache a foto

interface CommentProps {
  initialComments: any[];
  userList: any[]; // Agora recebendo a lista de usuários
  onSubmit: () => void;
  editTask: { id: number };
}

export default function SocialCommentFeed({ initialComments, userList, onSubmit, editTask }: CommentProps) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { DataFetchForm, DownloadFile, fetchData } = useConnection();

  const handleSend = async () => {
    if (!text.trim() && !selectedFile) return;

    const dataToSend = new FormData();
    dataToSend.append('task_item_id', editTask.id.toString());
    dataToSend.append('comment', text);

    if (selectedFile) {
      dataToSend.append('file', selectedFile);
    }

    const response = await DataFetchForm({
      method: "POST",
      params: dataToSend,
      pathFile: 'GTPP/TaskItemResponse.php',
    });

    if (response && !response.error) {
      setText("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onSubmit();
    } else {
      const errorMsg = response?.message || "Erro desconhecido ao salvar.";
      alert("Erro no servidor: " + errorMsg);
    }
  };

  const handleTrash = async (idToDelete: number) => {
    const res = await fetchData({
      method: "PUT",
      params: {
        id: idToDelete,
        status: "0"
      },
      pathFile: 'GTPP/TaskItemResponse.php',
    });

    if(res.error) throw new Error("Error this component", {cause: "400"});

    handleNotification("Apagado", res.message, "success");
  }

  return (
    <div className="d-flex flex-column border rounded bg-white" style={{ height: '450px' }}>
      <div className="flex-grow-1 p-3 overflow-auto bg-light" style={{ backgroundImage: 'linear-gradient(#f0f2f5, #e5e7eb)' }}>
        {initialComments.map((item) => {
          // LÓGICA PARA RESGATAR A FOTO DA USERLIST
          const userData = userList?.find((u: any) => Number(u.user_id) === Number(item.user.id));
          const userPhoto = userData?.photo ? convertImage(userData.photo) : imageUser;
          const userName = userData?.name || item.user.name;

          return item.status == 1 && (
            <div key={item.id} className="d-flex mb-3 align-items-start animate__animated animate__fadeIn">
              <img
                src={userPhoto} // Usando a foto resgatada da userList
                alt={userName}
                className="rounded-circle me-2 border shadow-sm"
                style={{ width: '38px', height: '38px', objectFit: 'cover' }}
              />
              <div className="d-flex flex-column w-100">
                <div className="bg-white p-2 px-3 rounded-4 shadow-sm border border-light w-100" style={{ width: 'fit-content', maxWidth: '90%' }}>
                  <div className='d-flex align-items-center justify-content-between w-100'>
                    <span className="fw-bold d-block small text-primary">                  
                      {localStorage.getItem('codUserGIPP') == item.user.id ? `Você` : userName}
                    </span>
                    <i onClick={() => {
                      handleTrash(item.id);
                    }} className='fa fa-solid fa-trash fa-sm d-block text-danger p-1 cursor-pointer'></i>
                  </div>

                  <span className="small text-dark" style={{ whiteSpace: 'pre-wrap' }}>{item.comment}</span>
                  
                  {item.file && item.file.file_name && (
                    <div className="mt-2 p-2 border rounded-3 bg-light d-flex align-items-center border-secondary-subtle">
                      <i className="bi bi-file-earmark-arrow-down-fill text-danger fs-5 me-2"></i>
                      <div className="d-flex flex-column overflow-hidden">
                        <span className="small fw-bold text-truncate" style={{ maxWidth: '180px' }}>{item.file.file_name}</span>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>{item.file.file_type}</span>
                      </div>
                      <button className="btn btn-sm btn-link text-dark ms-2" onClick={async () => {
                          await DownloadFile({
                              method: 'GET',
                              params: null,
                              pathFile: 'GTPP/Handlers/TaskItemResponse.php',
                              urlComplement: `&id_comment=${item.id}`
                          });
                        }}> 
                          <i className="fa fa-solid fa-download text-primary"></i>
                      </button>
                    </div>
                  )}
                </div>
                <small className="text-muted mt-1 ms-2" style={{ fontSize: '0.7rem' }}>{item.created_at}</small>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER DO CHAT */}
      <div className="p-3 border-top bg-white rounded-bottom">
        {selectedFile && (
          <div className="badge bg-secondary mb-2 d-flex align-items-center p-2 rounded-pill">
            <i className="bi bi-paperclip me-1"></i>
            <span className="small fw-normal">{selectedFile.name}</span>
            <i className="bi bi-x-circle-fill ms-2 cursor-pointer" onClick={() => setSelectedFile(null)}></i>
          </div>
        )}
        <div className="d-flex align-items-center">
          <button className="btn btn-secondary rounded-circle border-0 me-2" onClick={() => fileInputRef.current?.click()}>
            <i className="fa fa-solid fa-file text-white"></i>
          </button>
          <input type="file" ref={fileInputRef} className="d-none" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          <div className="flex-grow-1 bg-light rounded-pill border px-3 py-1 d-flex align-items-center">
            <input
              type="text"
              className="form-control border-0 bg-transparent shadow-none"
              placeholder="Escreva um comentário..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
          </div>
          <button className="btn btn-success rounded-circle ms-2 shadow" onClick={handleSend}>
            <i className="fa fa-solid fa-save text-white"></i>
          </button>
        </div>
      </div>
    </div>
  );
}