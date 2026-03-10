import { useCallback } from "react";
import { convertImageToWebp } from "../utils/imageConversion";
import { isAllowedFile, MAX_FILE_SIZE } from "../utils/fileValidation";

const TARGET_SIZE = 200 * 1024; // 200KB

export function useFileProcessor(onFileReady: (base64: string, fileName: string) => void) {
  const processFile = useCallback((file: File | null) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert("O arquivo excede o limite de 15MB.");
      return;
    }

    if (!isAllowedFile(file)) {
      alert(`Tipo de arquivo não suportado: ${file.name} (${file.type})`);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {

      try {
        const result = e.target?.result?.toString() || "";

        if (file.type.startsWith("image/")) {

          if (file.size <= TARGET_SIZE) {
            onFileReady(result, file.name);
            return;
          }

          const converted = await convertImageToWebp(result);
          const newName = file.name.replace(/\.[^/.]+$/, ".webp");
          onFileReady(converted, newName);
        } else {
          onFileReady(result, file.name);
        }

      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        alert("Erro ao processar o arquivo.");
      }

    };
    reader.onerror = () => {
      alert("Erro ao ler o arquivo.");
    };
    reader.readAsDataURL(file);
  }, [onFileReady]);

  return { processFile };
}