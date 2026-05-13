// FILE ROLE: Visual Asset Orchestrator (Processing, Compression, URL Resolution)
// DEPENDS ON: TECH constants, THEME colors, FileReader API
// CONSUMED BY: ProductCard.tsx, HeroCarousel.tsx, AddProductModal.tsx
import { TECH, LABELS, THEME } from '../data/config';
import { supabase } from '../supabase';
import { slugify } from './core';

/**
 * resolveVisualAssetUrl: Harmonizes raw storage paths into valid public URLs.
 */
export const resolveVisualAssetUrl = (
  assetPath: string | null | undefined,
): string | null => {
  if (!assetPath) return null;
  // Early exit if the path is already an absolute URL, data URI, or blob URL
  if (
    assetPath.startsWith('http') ||
    assetPath.startsWith('data:') ||
    assetPath.startsWith('blob:')
  )
    return assetPath;

  const applicationBaseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
  const standardizedPath = assetPath.startsWith('/')
    ? assetPath
    : `/${assetPath}`;
  return `${applicationBaseUrl}${standardizedPath}`;
};

// Centralized placeholder for products without images
export const PLACEHOLDER_VISUAL_SYMBOL = TECH.storage.placeholderEmoji;

/**
 * transformFileToVisualElement: Asynchronously converts a raw File object to an HTML Image.
 */
const transformFileToVisualElement = (
  visualFile: File,
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const visualElement = new Image();
      visualElement.onload = () => resolve(visualElement);
      visualElement.onerror = () => reject(new Error(LABELS.errors.imageLoad));
      visualElement.src = event.target?.result as string;
    };
    fileReader.onerror = () => reject(new Error(LABELS.errors.fileRead));
    fileReader.readAsDataURL(visualFile);
  });
};

/**
 * processDualQualityVisuals: Generates high-definition and preview-optimized copies from a single file.
 */
export async function processDualQualityVisuals(
  visualFile: File,
  hqMaxWidth?: number,
): Promise<{ hq: Blob; lq: Blob }> {
  const visualElement = await transformFileToVisualElement(visualFile);

  /**
   * generateOptimizedBlob: Resizes and compresses the image into a specific Blob tier.
   */
  const generateOptimizedBlob = (
    maximumDimension: number,
    compressionQuality: number,
  ): Promise<Blob> => {
    return new Promise((resolve) => {
      const drawingCanvas = document.createElement('canvas');
      let { width: originalWidth, height: originalHeight } = visualElement;

      // Aspect-Ratio Preserving Downscaling Logic
      if (originalWidth > originalHeight && originalWidth > maximumDimension) {
        originalHeight = Math.round(
          (originalHeight * maximumDimension) / originalWidth,
        );
        originalWidth = maximumDimension;
      } else if (originalHeight > maximumDimension) {
        originalWidth = Math.round(
          (originalWidth * maximumDimension) / originalHeight,
        );
        originalHeight = maximumDimension;
      }

      drawingCanvas.width = originalWidth;
      drawingCanvas.height = originalHeight;
      const drawingContext = drawingCanvas.getContext('2d');

      if (drawingContext) {
        // Fallback Background: Prevents transparency issues in JPEGs
        drawingContext.fillStyle = THEME.colors.visualFallback;
        drawingContext.fillRect(0, 0, originalWidth, originalHeight);
        drawingContext.drawImage(
          visualElement,
          0,
          0,
          originalWidth,
          originalHeight,
        );
      }

      drawingCanvas.toBlob(
        (optimizedBlob) => resolve(optimizedBlob!),
        'image/jpeg',
        compressionQuality,
      );
    });
  };

  // Tier 1: High-Definition Asset for Zoom/Detail views
  const hqLimit = hqMaxWidth || TECH.storage.productHqWidth;
  const highDefinitionAsset = await generateOptimizedBlob(
    hqLimit,
    TECH.storage.hqQuality,
  );

  // Tier 2: Lightweight Preview Asset for Catalog/Grid views
  const previewLightweightAsset = await generateOptimizedBlob(
    TECH.storage.productLqWidth,
    TECH.storage.lqQuality,
  );

  return { hq: highDefinitionAsset, lq: previewLightweightAsset };
}

/**
 * compressVisualToDataUri: Legacy-compatible compression for immediate Base64 feedback.
 */
export async function compressVisualToDataUri(
  visualFile: File,
  maximumDimension: number,
  compressionQuality: number,
): Promise<string> {
  const visualElement = await transformFileToVisualElement(visualFile);
  const drawingCanvas = document.createElement('canvas');
  let { width: originalWidth, height: originalHeight } = visualElement;

  if (originalWidth > originalHeight && originalWidth > maximumDimension) {
    originalHeight = Math.round(
      (originalHeight * maximumDimension) / originalWidth,
    );
    originalWidth = maximumDimension;
  } else if (originalHeight > maximumDimension) {
    originalWidth = Math.round(
      (originalWidth * maximumDimension) / originalHeight,
    );
    originalHeight = maximumDimension;
  }

  drawingCanvas.width = originalWidth;
  drawingCanvas.height = originalHeight;
  const drawingContext = drawingCanvas.getContext('2d');

  if (drawingContext) {
    drawingContext.fillStyle = THEME.colors.visualFallback;
    drawingContext.fillRect(0, 0, originalWidth, originalHeight);
    drawingContext.drawImage(
      visualElement,
      0,
      0,
      originalWidth,
      originalHeight,
    );
  }

  return drawingCanvas.toDataURL('image/jpeg', compressionQuality);
}

/**
 * resizeImageForAI: Downscales image to AI-friendly dimensions to prevent 413 errors.
 */
export async function resizeImageForAI(imageFile: File | Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(imageFile);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      const maxSize = 1024;
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Resize failed'));
          URL.revokeObjectURL(img.src);
        },
        'image/jpeg',
        0.82,
      );
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(img.src);
      reject(err);
    };
  });
}

/**
 * downloadImage: Forces a client-side download of a visual asset with custom naming.
 * Uses Canvas for cross-origin compliance when possible.
 */
export async function downloadImage(url: string, fileName: string) {
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.onerror = () => window.open(url, '_blank');
  } catch (err) {
    console.error('Download error:', err);
    window.open(url, '_blank');
  }
}

/**
 * secureUploadVisualAsset: Unified engine for optimized, authorized, and cleaned-up asset uploads.
 */
export async function secureUploadVisualAsset({
  file,
  folder,
  adminPin,
  oldUrl,
  slugBaseName,
  uniqueIdPrefix = '',
  isDualQuality = true
}: {
  file: File;
  folder: string;
  adminPin: string;
  oldUrl?: string | null;
  slugBaseName: string;
  uniqueIdPrefix?: string;
  isDualQuality?: boolean;
}): Promise<string> {
  // 1. Authorization
  if (!adminPin) throw new Error('Security Error: PIN required for storage operations.');

  // 2. Hygiene: Cleanup old assets
  if (oldUrl) {
    try {
      const assetUrl = new URL(oldUrl);
      const fileName = assetUrl.pathname.split('/').pop();
      if (fileName && !fileName.includes('placeholder')) {
        const pathsToDelete = isDualQuality 
          ? [`${TECH.storage.lqFolder}/${fileName}`, `${TECH.storage.hqFolder}/${fileName}`]
          : [`${folder}/${fileName}`];

        for (const path of pathsToDelete) {
          await supabase.rpc('authorize_storage_op', { p_pin: adminPin, p_file_path: path });
        }
        await supabase.storage.from(TECH.storage.bucket).remove(pathsToDelete);
      }
    } catch { /* Silent fail for hygiene */ }
  }

  // 3. Optimization
  const sanitizedName = slugify(slugBaseName).substring(0, TECH.products.maxFileNameLength);
  const uniqueSuffix = Math.random().toString(36).substring(2, 2 + TECH.products.uniqueIdSuffixLength);
  const storageFileName = `${sanitizedName}-${uniqueIdPrefix ? `${uniqueIdPrefix}-` : ''}${uniqueSuffix}.jpg`;

  if (isDualQuality) {
    const { hq, lq } = await processDualQualityVisuals(file);
    const lqPath = `${TECH.storage.lqFolder}/${storageFileName}`;
    const hqPath = `${TECH.storage.hqFolder}/${storageFileName}`;

    await Promise.all([
      supabase.rpc('authorize_storage_op', { p_pin: adminPin, p_file_path: lqPath }),
      supabase.rpc('authorize_storage_op', { p_pin: adminPin, p_file_path: hqPath })
    ]);

    const [lqRes, hqRes] = await Promise.all([
      supabase.storage.from(TECH.storage.bucket).upload(lqPath, lq, { upsert: true, cacheControl: TECH.storage.cacheControl }),
      supabase.storage.from(TECH.storage.bucket).upload(hqPath, hq, { upsert: true, cacheControl: TECH.storage.cacheControl }),
    ]);

    if (lqRes.error) throw lqRes.error;
    if (hqRes.error) throw hqRes.error;

    const { data: { publicUrl } } = supabase.storage.from(TECH.storage.bucket).getPublicUrl(lqPath);
    return `${publicUrl}?t=${Date.now()}`;
  } else {
    // Single quality upload (e.g. Logo)
    const optimized = await compressVisualToDataUri(file, 400, 0.85);
    const blob = await (await fetch(optimized)).blob();
    const filePath = `${folder}/${storageFileName}`;

    await supabase.rpc('authorize_storage_op', { p_pin: adminPin, p_file_path: filePath });
    const { error } = await supabase.storage.from(TECH.storage.bucket).upload(filePath, blob, { upsert: true, cacheControl: TECH.storage.cacheControl });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from(TECH.storage.bucket).getPublicUrl(filePath);
    return `${publicUrl}?t=${Date.now()}`;
  }
}
