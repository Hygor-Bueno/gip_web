import { useCallback } from 'react';
import { convertImageToWebp } from '../utils/imageConversion';
import { isAllowedFile, MAX_FILE_SIZE } from '../utils/fileValidation';

export function useFileProcessor(onFileReady: (base64: string, fileName: string) => void) {
  const processFile = useCallback((file: File | null) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert('O arquivo excede o limite de 15MB.');
      return;
    }

    if (!isAllowedFile(file)) {
      alert(`Tipo de arquivo não suportado: ${file.name} (${file.type})`);
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      const result = e.target?.result?.toString() || '';

      if (file.type.startsWith('image/')) {
        const converted = await convertImageToWebp(result);
        onFileReady(converted, file.name);
      } else {
        onFileReady(result, file.name);
      }
    };

    reader.readAsDataURL(file);
  }, [onFileReady]);

  return { processFile };
}
