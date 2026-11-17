import { getApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from './firebaseClient';

export interface ProcessedBannerImage {
  url: string;
  storageMode: 'firebase-storage' | 'optimized-data-url';
  sizeKb: number;
}

/**
 * Normalizes external image URLs (e.g., converts Google Drive view links into direct image URLs).
 */
export function normalizeBannerImageUrl(rawUrl: string): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return '';

  // Support already-valid local asset paths or data URLs
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('/')) {
    return trimmed;
  }

  // Convert Google Drive share links to direct viewable CDN links
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveFileMatch?.[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }
  const driveOpenMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/i);
  if (driveOpenMatch?.[1]) {
    return `https://lh3.googleusercontent.com/d/${driveOpenMatch[1]}`;
  }

  // Ensure protocol is present for domain-style URLs
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

/**
 * Validates that a banner URL or data URI has a safe, renderable scheme.
 */
export function isValidBannerImageSrc(src: string): boolean {
  const clean = (src || '').trim();
  if (!clean) return false;
  return (
    clean.startsWith('https://') ||
    clean.startsWith('http://') ||
    clean.startsWith('data:image/') ||
    clean.startsWith('/')
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Selected file could not be decoded as an image.'));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

/**
 * Optimizes a user-selected image file for mobile banners (max 1200px wide, < 220 KB)
 * and uploads to Firebase Storage when available, automatically falling back to an
 * optimized inline data URL so banners always save cleanly to Firestore & localStorage.
 */
export async function processAndUploadBannerImage(
  file: File,
  bannerId?: string
): Promise<ProcessedBannerImage> {
  const isImageMime = file.type.startsWith('image/');
  const isImageExt = /\.(png|jpe?g|webp|gif|bmp|avif|svg)$/i.test(file.name);
  if (!isImageMime && !isImageExt) {
    throw new Error('Please choose a valid image file (PNG, JPG, WebP, or GIF).');
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Image is too large (max 15 MB). Please choose a smaller image.');
  }

  const rawDataUrl = await readFileAsDataUrl(file);
  let optimizedBlob: Blob = file;
  let optimizedDataUrl = rawDataUrl;

  // Compress & resize non-SVG raster images cleanly via canvas
  const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
  if (!isSvg) {
    try {
      const img = await loadImageElement(rawDataUrl);
      const maxW = 1200;
      const maxH = 700;
      let targetW = img.naturalWidth || 900;
      let targetH = img.naturalHeight || 430;

      if (targetW > maxW) {
        targetH = Math.round((targetH * maxW) / targetW);
        targetW = maxW;
      }
      if (targetH > maxH) {
        targetW = Math.round((targetW * maxH) / targetH);
        targetH = maxH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, targetW);
      canvas.height = Math.max(1, targetH);
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const mimeType = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
        const qualitySteps = [0.84, 0.72, 0.60, 0.48];
        for (const q of qualitySteps) {
          const candidateDataUrl = canvas.toDataURL(mimeType, q);
          // Fallback to JPEG if browser encodes WebP request as PNG
          const finalDataUrl =
            candidateDataUrl.startsWith('data:image/png')
              ? canvas.toDataURL('image/jpeg', q)
              : candidateDataUrl;

          optimizedDataUrl = finalDataUrl;
          const approxBytes = Math.ceil((finalDataUrl.length * 3) / 4);
          const blob = await canvasToBlob(canvas, mimeType, q);
          if (blob) optimizedBlob = blob;

          if (approxBytes <= 220 * 1024) {
            break;
          }
        }
      }
    } catch {
      // If canvas decode fails (e.g. uncommon format), ensure raw size fits Firestore
      if (rawDataUrl.length > 650 * 1024) {
        throw new Error('Could not process this image format cleanly. Please try a JPG or PNG image.');
      }
    }
  }

  const finalSizeKb = Math.max(1, Math.round((optimizedDataUrl.length * 3) / 4 / 1024));

  // Attempt Firebase Storage upload when authenticated; quickly fall back to compressed data URL
  if (auth.currentUser && getApps().length > 0) {
    try {
      const storage = getStorage(getApp());
      const safeName = (bannerId || `banner_${Date.now().toString(36)}`).replace(/[^a-zA-Z0-9_-]/g, '');
      const storageRef = ref(storage, `banners/${safeName}`);
      const uploadPromise = uploadBytes(storageRef, optimizedBlob, {
        contentType: optimizedBlob.type || 'image/jpeg'
      }).then((snap) => getDownloadURL(snap.ref));

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Storage upload timed out')), 4500)
      );

      const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);
      return {
        url: downloadUrl,
        storageMode: 'firebase-storage',
        sizeKb: Math.max(1, Math.round(optimizedBlob.size / 1024))
      };
    } catch {
      // Storage bucket rules/CORS unavailable in current environment; continue with compressed inline URL
    }
  }

  // Verify compressed data URL stays safely under Firestore 1MB limit
  if (optimizedDataUrl.length > 750 * 1024) {
    throw new Error('Compressed image still exceeds 750 KB. Please upload a smaller image.');
  }

  return {
    url: optimizedDataUrl,
    storageMode: 'optimized-data-url',
    sizeKb: finalSizeKb
  };
}
