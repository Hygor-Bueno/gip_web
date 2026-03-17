const TARGET_SIZE_BYTES = 200 * 1024;
const MAX_WIDTH = 1920;

export async function convertImageToWebp(base64: string): Promise<string> {
  const img = await loadImage(base64);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  let width = img.width;
  let height = img.height;

  if (width > MAX_WIDTH) {
    height = (MAX_WIDTH / width) * height;
    width = MAX_WIDTH;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  let minQuality = 0.1;
  let maxQuality = 1.0;
  let bestResult = "";
  
  // Binary search for the best quality (max 6 iterations for performance)
  for (let i = 0; i < 6; i++) {
    const midQuality = (minQuality + maxQuality) / 2;
    const dataUrl = canvas.toDataURL("image/webp", midQuality);
    const size = getBase64Size(dataUrl);

    if (size <= TARGET_SIZE_BYTES) {
      bestResult = dataUrl;
      minQuality = midQuality;
    } else {
      maxQuality = midQuality;
    }
  }

  // Fallback if the first attempt was already too big
  return bestResult || canvas.toDataURL("image/webp", 0.1);
}


function getBase64Size(base64: string): number {
  // Faster way to calculate byte size from base64
  const padding = (base64.endsWith('==') ? 2 : (base64.endsWith('=') ? 1 : 0));
  return (base64.length * (3 / 4)) - padding - (base64.split(',')[0].length + 1);
}

function loadImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; 
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error("Failed to load image"));
    img.src = base64;
  });
}