import React, { useCallback, useState } from 'react';

interface FileDropzoneProps {
  onFileSelected: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelected,
  accept,
  disabled,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;

    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] || null;
    onFileSelected(file);
  }, [onFileSelected, disabled]);

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`d-flex flex-column align-items-center justify-content-center w-100 h-100 p-4 text-center rounded-3 transition-all ${
        disabled ? 'opacity-50' : ''
      }`}
      style={{
        minHeight: '220px',
        border: `2px dashed ${isDragging ? '#0d6efd' : '#ced4da'}`,
        backgroundColor: isDragging ? 'rgba(13, 110, 253, 0.04)' : 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 1s ease-in-out'
      }}
    >
      <input
        type="file"
        hidden
        accept={accept}
        disabled={disabled}
        onChange={(e) => {
          onFileSelected(e.target.files?.[0] || null);
          e.target.value = ''; 
        }}
      />

      <i 
        className={`fa-solid fa-cloud-arrow-up mb-3 ${isDragging ? 'text-primary' : 'text-secondary'}`} 
        style={{ 
          fontSize: '3.5rem', 
          opacity: isDragging ? 1 : 0.5,
          transition: 'all 0.2s ease-in-out',
          transform: isDragging ? 'scale(1.1)' : 'scale(1)'
        }} 
      />

      <h5 className={`fw-semibold mb-2 fs-6 fs-md-5 ${isDragging ? 'text-primary' : 'text-dark'}`}>
        Arraste um arquivo ou clique para buscar aqui!
      </h5>

      <span className="text-muted mt-1 px-3" style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
        Você também pode usar <kbd className="bg-light text-dark border">CTRL</kbd> + <kbd className="bg-light text-dark border">V</kbd> para colar direto da área de transferência.
      </span>
    </label>
  );
};