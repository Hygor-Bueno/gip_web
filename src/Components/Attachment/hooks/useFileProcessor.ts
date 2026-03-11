import { useCallback } from "react";
import { convertImageToWebp } from "../utils/imageConversion";
import { isAllowedFile, MAX_FILE_SIZE } from "../utils/fileValidation";
import { handleNotification } from "../../../Util/Utils";

const TARGET_SIZE = 200 * 1024;

export function useFileProcessor(onFileReady: (base64: string, fileName: string) => void) {
  const processFile = useCallback((file: File | null) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      handleNotification('Erro', "O arquivo excede o limite de 15MB.", 'danger');
      return;
    }

    if (!isAllowedFile(file)) {
      handleNotification('Erro!', `Tipo de arquivo não suportado: ${file.name} (${file.type})`, 'danger');
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
        handleNotification('Erro!',"Erro ao processar o arquivo.", 'danger');
      }

    };
    reader.onerror = () => {
      handleNotification('Erro!', "Erro ao ler o arquivo.", 'danger');
    };
    reader.readAsDataURL(file);
  }, [onFileReady]);

  return { processFile };
}