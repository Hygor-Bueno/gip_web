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
      className="file-dropzone"
      data-dragging={isDragging}
    >
      <input
        type="file"
        hidden
        accept={accept}
        disabled={disabled}
        onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
      />

      <div className="fa fa-paperclip mb-2" style={{ fontSize: 24 }} />

      <strong>
        {isDragging
          ? 'Solte o arquivo aqui'
          : 'Arraste um arquivo aqui ou clique para selecionar'}
      </strong>

      <span className="text-muted mt-1" style={{ fontSize: 12 }}>
        Você também pode usar CTRL+V
      </span>
    </label>
  );
};
