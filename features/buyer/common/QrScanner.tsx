import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls, Result } from "@zxing/browser";

type Props = {
  onDecode: (text: string) => void;
  onClose?: () => void;
};

export default function QrScanner({ onDecode, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let stopped = false;

    async function start() {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const deviceId = devices?.[0]?.deviceId;
        if (!deviceId) throw new Error("Камера не найдена");

        const controls = await codeReader.decodeFromVideoDevice(
          deviceId,
          videoRef.current!,
          (result: Result | undefined, err) => {
            if (result && !stopped) {
              stopped = true;
              onDecode(result.getText());
            }
          }
        );
        controlsRef.current = controls;
      } catch (e: any) {
        setError(e?.message || "Ошибка доступа к камере");
      }
    }
    void start();

    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [onDecode]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Сканировать QR</h3>
          <button onClick={onClose} className="px-3 py-1 rounded hover:bg-slate-100">Закрыть</button>
        </div>

        <div className="p-3">
          {error ? (
            <div className="text-rose-600 text-sm">{error}</div>
          ) : (
            <div className="rounded-xl overflow-hidden border bg-black">
              <video ref={videoRef} className="w-full aspect-video" muted playsInline />
            </div>
          )}
          <p className="text-slate-500 text-sm mt-2">
            Наведите камеру на QR-код с серийным номером или ссылкой.
          </p>
        </div>
      </div>
    </div>
  );
}
