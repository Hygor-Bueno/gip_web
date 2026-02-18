import React, { useState, useRef } from 'react';

interface CommentProps {
  initialComments: any[];
  onSubmit: (text: string, file: File | null) => void;
}

export default function SocialCommentFeed({ initialComments, onSubmit }: CommentProps) {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (text.trim() || selectedFile) {
      onSubmit(text, selectedFile);
      setText("");
      setSelectedFile(null);
    }
  };

  return (
    <div className="d-flex flex-column border rounded bg-white" style={{ height: '450px' }}>
      <div className="flex-grow-1 p-3 overflow-auto bg-light" style={{ backgroundImage: 'linear-gradient(#f0f2f5, #e5e7eb)' }}>
        {initialComments.map((item) => (
          <div key={item.id} className="d-flex mb-3 align-items-start">
            <img 
              src={item.user.photo}
              alt={item.user.name} 
              className="rounded-circle me-2 border shadow-sm" 
              style={{ width: '38px', height: '38px', objectFit: 'cover' }}
            />
            <div className="d-flex flex-column w-100">
              <div className="bg-white p-2 px-3 rounded-4 shadow-sm border border-light" style={{ width: 'fit-content', maxWidth: '90%' }}>
                <span className="fw-bold d-block small text-primary">{item.user.name}</span>
                <span className="small text-dark" style={{ whiteSpace: 'pre-wrap' }}>{item.comment}</span>
                {item.file_path && (
                  <div className="mt-2 p-2 border rounded-3 bg-light d-flex align-items-center border-secondary-subtle">
                    <i className="bi bi-file-earmark-arrow-down-fill text-danger fs-5 me-2"></i>
                    <div className="d-flex flex-column overflow-hidden">
                      <span className="small fw-bold text-truncate" style={{ maxWidth: '180px' }}>{item.file_name}</span>
                      <span className="text-muted" style={{ fontSize: '0.7rem' }}>{item.file_type}</span>
                    </div>
                    <a href={`SUA_URL_X_SENDFILE?id=${item.id}`} className="btn btn-sm btn-link text-dark ms-2">
                      <i className="fa fa-solid fa-download text-white"></i>
                    </a>
                  </div>
                )}
              </div>
              <small className="text-muted mt-1 ms-2" style={{ fontSize: '0.7rem' }}>{item.created_at}</small>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-top bg-white rounded-bottom">
        {selectedFile && (
          <div className="badge bg-secondary mb-2 d-flex align-items-center p-2 rounded-pill" style={{ width: 'fit-content' }}>
            <i className="bi bi-paperclip me-1"></i>
            <span className="small fw-normal">{selectedFile.name}</span>
            <i className="bi bi-x-circle-fill ms-2 cursor-pointer" onClick={() => setSelectedFile(null)} style={{ cursor: 'pointer' }}></i>
          </div>
        )}
        <div className="d-flex align-items-center">
          <button className="btn btn-secondary rounded-circle border-0 me-2" onClick={() => fileInputRef.current?.click()}title="Anexar arquivo">
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
          <button 
            className="btn btn-success rounded-circle ms-2 shadow d-flex align-items-center justify-content-center"
            style={{ width: '40px', height: '40px' }}
            onClick={handleSend}
          >
            <i className="fa fa-solid fa-save text-white"></i>
          </button>
        </div>
      </div>
    </div>
  );
}