const TARGET_SIZE = 200 * 1024;

export async function convertImageToWebp(base64: string): Promise<string> {

  const img = await loadImage(base64);
  const width = img.width;
  const height = img.height;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  let quality = 0.9;
  let result = canvas.toDataURL("image/webp", quality);

  while (getBase64Size(result) > TARGET_SIZE && quality > 0.2) {
    quality -= 0.1;
    result = canvas.toDataURL("image/webp", quality);
  }

  return result;
}

function loadImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = base64;
  });
}

function getBase64Size(base64: string) {
  const stringLength = base64.length - "data:image/webp;base64,".length;
  const sizeInBytes = (stringLength * 3) / 4;
  return sizeInBytes;
}