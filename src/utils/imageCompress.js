// Shrinks images before they are saved (cover images, payment screenshots).
// A phone photo of 3-8 MB becomes ~100-300 KB, which keeps every page fast and stays well
// under the hosting limit of 4.5 MB per request.

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read the image'));
    img.src = src;
  });

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/** Re-encodes an image data URL as a JPEG no larger than maxDim px on its longest side. */
export const compressDataUrl = async (dataUrl, { maxDim = 1600, quality = 0.8 } = {}) => {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/') || /^data:image\/(gif|svg)/.test(dataUrl)) {
    return dataUrl;
  }
  try {
    const img = await loadImage(dataUrl);
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; // transparent PNGs get a white background instead of black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const out = canvas.toDataURL('image/jpeg', quality);
    return out.length < dataUrl.length ? out : dataUrl;
  } catch {
    return dataUrl;
  }
};

/** Reads an image file as a (compressed) data URL. */
export const compressImageFile = async (file, options) => compressDataUrl(await readAsDataUrl(file), options);
