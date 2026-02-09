import { IMAGE_WEBP_QUALITY } from "../../../Util/Util";

export async function convertImageToWebp(base64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      let webp = canvas.toDataURL('image/webp', IMAGE_WEBP_QUALITY);
      if (!webp.startsWith('data:image/webp')) {
        webp = canvas.toDataURL('image/png');
      }

      resolve(webp);
    };
    img.src = base64;
  });
}
