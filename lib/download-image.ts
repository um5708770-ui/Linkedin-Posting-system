/**
 * Robust image downloader for Windows Photos and standard media viewers.
 * Converts Data URIs (SVG, JPEG, WEBP) to actual Blobs with matching extensions
 * to prevent format corruption errors when opening downloaded files.
 */
export async function downloadImageFile(imageUrl: string | null, filenamePrefix: string = 'linkedin-graphic') {
  if (!imageUrl) return;

  try {
    let blob: Blob;

    if (imageUrl.startsWith('data:')) {
      if (imageUrl.includes('image/svg+xml')) {
        // Convert SVG Data URI to a clean raster PNG Blob for Windows Photos compatibility
        blob = await svgDataUriToPngBlob(imageUrl);
      } else {
        // Fetch base64 data URI directly into a Blob
        const res = await fetch(imageUrl);
        blob = await res.blob();
      }
    } else {
      // External HTTP URL or Object URL
      const res = await fetch(imageUrl);
      blob = await res.blob();
    }

    // Determine accurate extension matching the blob type
    let ext = 'png';
    if (blob.type === 'image/jpeg') ext = 'jpg';
    else if (blob.type === 'image/webp') ext = 'webp';

    const filename = `${filenamePrefix}.${ext}`;

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  } catch (err) {
    console.warn('Blob conversion failed, using direct anchor fallback:', err);
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${filenamePrefix}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

function svgDataUriToPngBlob(svgDataUri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 800;
      canvas.height = img.height || 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context failed'));
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('PNG conversion failed'));
      }, 'image/png');
    };
    img.onerror = (e) => reject(e);
    img.src = svgDataUri;
  });
}
