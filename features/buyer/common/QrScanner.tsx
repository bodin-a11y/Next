import React, { useEffect, useRef, useState } from "react";

export type QrScannerProps = {
  onDecode: (text: string) => void;
  onClose: () => void;
};

type BarcodeDetectorLike =
  | (new (options?: { formats?: string[] }) => {
      detect: (source: CanvasImageSource | ImageBitmap | ImageData) => Promise<
        { rawValue: string; format?: string }[]
      >;
    })
  | undefined;

const hasBarcodeDetector =
  typeof window !== "undefined" &&
  // @ts-ignore
  typeof (window as any).BarcodeDetector !== "undefined";

/**
 * Лёгкий QR-сканер:
 * - Пытается использовать BarcodeDetector + камеру (live)
 * - Если не доступно: fallback на загрузку изображения + ручной ввод
 */
export default function QrScanner({ onDecode, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [usingLiveScan, setUsingLiveScan] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [manualValue, setManualValue] = useState("");

  // Инициализация live-сканирования, если есть BarcodeDetector
  useEffect(() => {
    let cancelled = false;

    async function start() {
      setError(null);

      if (!hasBarcodeDetector) {
        // Нет поддержки — используем fallback секцию ниже (загрузка изображений)
        setUsingLiveScan(false);
        return;
      }

      try {
        // @ts-ignore
        const BarcodeDetectorCtor: BarcodeDetectorLike = (window as any).BarcodeDetector;
        // @ts-ignore
        const supported = await (window as any).BarcodeDetector?.getSupportedFormats?.();
        const formats = Array.isArray(supported) && supported.length
          ? supported
          : ["qr_code", "aztec", "data_matrix", "pdf417"];

        // @ts-ignore
        const detector = new (BarcodeDetectorCtor as any)({ formats });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        if (cancelled) return;

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setUsingLiveScan(true);

        // Запускаем цикл сканирования
        const loop = async () => {
          if (cancelled) return;

          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!video || !canvas) {
            rafRef.current = requestAnimationFrame(loop);
            return;
          }

          if (video.readyState >= 2) {
            const w = video.videoWidth || 640;
            const h = video.videoHeight || 480;
            if (canvas.width !== w) canvas.width = w;
            if (canvas.height !== h) canvas.height = h;

            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(video, 0, 0, w, h);

              try {
                // BarcodeDetector умеет принимать CanvasImageSource напрямую,
                // но для надёжности подадим ImageBitmap если доступен.
                let source: CanvasImageSource = canvas;
                // @ts-ignore
                if (window.createImageBitmap) {
                  // @ts-ignore
                  const bmp = await createImageBitmap(canvas);
                  source = bmp as unknown as CanvasImageSource;
                  // @ts-ignore
                  const results = await detector.detect(source);
                  // @ts-ignore
                  if (bmp?.close) bmp.close();
                  if (results && results.length > 0) {
                    const text = results[0].rawValue?.trim();
                    if (text) {
                      stopStream();
                      onDecode(text);
                      return;
                    }
                  }
                } else {
                  // @ts-ignore
                  const results = await detector.detect(source);
                  if (results && results.length > 0) {
                    const text = results[0].rawValue?.trim();
                    if (text) {
                      stopStream();
                      onDecode(text);
                      return;
                    }
                  }
                }
              } catch (err) {
                // Игнорируем единичные ошибки детекции, не спамим
              }
            }
          }

          rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
      } catch (e: any) {
        setError(
          e?.message ||
            "Не удалось открыть камеру или инициализировать сканер. Попробуйте загрузить изображение."
        );
        setUsingLiveScan(false);
      }
    }

    start();

    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  function stopStream() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  // Смена камеры (фронталка/тыл)
  const toggleFacing = () => {
    stopStream();
    setUsingLiveScan(false);
    setFacingMode((m) => (m === "environment" ? "user" : "environment"));
  };

  // Fallback: загрузка изображения → попытка распознать (если есть BarcodeDetector)
  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!hasBarcodeDetector) {
      setError(
        "Ваш браузер не поддерживает распознавание штрих-кодов/QR. Введите номер вручную."
      );
      return;
    }

    // @ts-ignore
    const BarcodeDetectorCtor: BarcodeDetectorLike = (window as any).BarcodeDetector;
    // @ts-ignore
    const supported = await (window as any).BarcodeDetector?.getSupportedFormats?.();
    const formats = Array.isArray(supported) && supported.length
      ? supported
      : ["qr_code", "aztec", "data_matrix", "pdf417"];
    // @ts-ignore
    const detector = new (BarcodeDetectorCtor as any)({ formats });

    const img = new Image();
    img.onload = async () => {
      try {
        const off = document.createElement("canvas");
        off.width = img.naturalWidth;
        off.height = img.naturalHeight;
        const ctx = off.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("Canvas context failed");
        ctx.drawImage(img, 0, 0);

        // @ts-ignore
        const results = await detector.detect(off);
        if (results && results.length > 0) {
          const text = results[0].rawValue?.trim();
          if (text) {
            onDecode(text);
            return;
          }
        }
        setError("QR не обнаружен на изображении. Попробуйте другое фото.");
      } catch (err: any) {
        setError(err?.message || "Не удалось распознать QR на изображении.");
      }
    };
    img.onerror = () => setError("Не удалось загрузить изображение.");
    img.src = URL.createObjectURL(file);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Сканировать QR</h3>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-sm bg-slate-100 hover:bg-slate-200"
          >
            Закрыть
          </button>
        </div>

        <div className="p-5 space-y-4">
          {usingLiveScan ? (
            <div className="space-y-3">
              <div className="relative w-full aspect-video bg-black overflow-hidden rounded-lg">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                {/* рисуем кадры на канвас вне видимости */}
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 pointer-events-none">
                  {/* простая рамка прицеливания */}
                  <div className="absolute inset-6 border-2 border-white/70 rounded-lg" />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleFacing}
                  className="px-3 py-2 rounded-md border bg-white hover:bg-slate-50"
                >
                  Поменять камеру
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Готово
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Ваш браузер не поддерживает live-сканирование или доступ к камере
                не был предоставлен. Вы можете загрузить фото с QR или ввести
                серийный номер вручную.
              </p>

              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  Загрузить изображение с QR
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPickImage}
                  className="block w-full text-sm text-slate-600"
                />
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ввести вручную
                </label>
                <div className="flex gap-2">
                  <input
                    value={manualValue}
                    onChange={(e) => setManualValue(e.target.value)}
                    placeholder="SN123456"
                    className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    onClick={() => {
                      const v = manualValue.trim();
                      if (!v) return;
                      onDecode(v);
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    ОК
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {!usingLiveScan && hasBarcodeDetector && (
            <div className="text-xs text-slate-500">
              Подсказка: попробуйте выдать доступ к камере и открыть модалку
              заново, чтобы включить live-сканирование.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
