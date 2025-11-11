// lib/image.ts
import imageCompression from "browser-image-compression";

/** Сжать один файл и вернуть dataURL (base64) */
export async function compressFileToBase64(
  file: File,
  opts?: Partial<{
    maxSizeMB: number;            // целевой размер в МБ
    maxWidthOrHeight: number;     // ограничение по стороне
    quality: number;              // 0..1 – влияет при jpeg/webp
  }>
): Promise<string> {
  const options = {
    maxSizeMB: 0.5,            // ~500KB по умолчанию
    maxWidthOrHeight: 1024,    // не больше 1024px по большей стороне
    useWebWorker: true,
    ...(opts || {}),
  };

  const compressed = await imageCompression(file, options);
  // Получаем dataURL (data:image/jpeg;base64,....)
  const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
  return dataUrl;
}

/** Сжать массив файлов и вернуть массив dataURL */
export async function compressFilesToBase64(
  files: File[],
  opts?: Parameters<typeof compressFileToBase64>[1]
): Promise<string[]> {
  const out: string[] = [];
  for (const f of files) {
    out.push(await compressFileToBase64(f, opts));
  }
  return out;
}
