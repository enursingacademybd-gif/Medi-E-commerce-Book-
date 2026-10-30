/**
 * Optimizes and compresses book cover images before storing or uploading.
 * Converts heavy camera/gallery photos (3MB-15MB) into lightweight, high-resolution
 * covers (under 100KB) to ensure instant loading and zero storage quota errors.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg';
}

export async function optimizeBookImage(
  file: File,
  options: OptimizeImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 650,
    maxHeight = 900,
    quality = 0.85,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    // If not a standard file, reject
    if (!file) {
      reject(new Error('কোনো ফাইল পাওয়া যায়নি।'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (!width || !height) {
        // Fallback to FileReader if dimensions couldn't be read
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('ছবি পড়তে সমস্যা হয়েছে।'));
        reader.readAsDataURL(file);
        return;
      }

      // Calculate aspect ratio preserving scale
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('ক্যানভাস তৈরি ব্যর্থ হয়েছে।'));
        reader.readAsDataURL(file);
        return;
      }

      // High-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill white background (useful for transparent PNGs converting to JPEG)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Draw the image
      ctx.drawImage(img, 0, 0, width, height);

      // Export compressed image
      try {
        const dataUrl = canvas.toDataURL(format, quality);
        resolve(dataUrl);
      } catch (err) {
        // Fallback to standard png if format conversion throws
        try {
          const fallbackDataUrl = canvas.toDataURL('image/png');
          resolve(fallbackDataUrl);
        } catch (e2) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('ছবি প্রসেসিংয়ে সমস্যা হয়েছে।'));
          reader.readAsDataURL(file);
        }
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Attempt FileReader fallback
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('ফাইলটি সঠিক ছবি নয় বা ক্ষতিগ্রস্ত।'));
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}
