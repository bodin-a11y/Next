// pages/installer.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

import { useAuth } from "../lib/auth-context";
import { api } from "../lib/api";
import { compressFilesToBase64 } from "../lib/image";

type QrScannerProps = {
  onDecode: (text: string) => void;
  onClose: () => void;
};

// Сканер грузим только на клиенте
const QrScanner = dynamic<QrScannerProps>(
  () => import("../features/buyer/common/QrScanner").then((m) => m.default),
  { ssr: false }
);

export default function InstallerPage() {
  const router = useRouter();
  const { profile, loading, logout } = useAuth();

  const [serial, setSerial] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scanOpen, setScanOpen] = useState(false);

  // 🔒 защита по роли
  useEffect(() => {
    if (!loading) {
      if (!profile || profile.role !== "installer") {
        router.replace("/login?role=installer");
      }
    }
  }, [loading, profile, router]);

  // ❗ никаких хуков ниже потенциального раннего return
  if (!profile || profile.role !== "installer") {
    return null;
  }
  const installerPhone = profile?.phone ?? "";

  // ✅ (2) Клиентская валидация изображений до компрессии
  function guardImage(file: File) {
    const okType = /^image\/(jpeg|jpg|png|webp)$/i.test(file.type);
    if (!okType) throw new Error("Допустимы JPG/PNG/WebP");
    if (file.size > 8 * 1024 * 1024) throw new Error("Файл больше 8 МБ");
  }

  // 📸 Загрузка + компрессия нескольких фото с лимитом (до 5)
  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList) return;

    // Сколько ещё можно добавить
    const spaceLeft = Math.max(0, 5 - photos.length);
    if (spaceLeft === 0) {
      alert("Максимум 5 фото");
      return;
    }

    // Берём не больше, чем осталось места
    const filesRaw = Array.from(fileList).slice(0, spaceLeft);

    try {
      // валидация
      filesRaw.forEach(guardImage);

      // компрессия
      const dataUrls = await compressFilesToBase64(filesRaw, {
        maxSizeMB: 0.6,
        maxWidthOrHeight: 1280,
      });

      setPhotos((prev) => [...prev, ...dataUrls]);
    } catch (err: any) {
      alert(err.message || "Не удалось обработать изображения");
    }
  }

  // 🧹 Удалить одно фото из списка
  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  // 🔍 Обработка результата сканера
  function handleDecoded(text: string) {
    try {
      const url = new URL(text);
      const sn = url.searchParams.get("sn");
      if (sn) {
        setScanOpen(false);
        setSerial(sn);
        return;
      }
    } catch {
      /* не URL — просто строка */
    }
    const plain = text.trim();
    if (plain) {
      setScanOpen(false);
      setSerial(plain);
    }
  }

  // ✅ (12) Проактивная проверка статуса при блюре серийника
  async function handleSerialBlur() {
    const sn = serial.trim();
    if (!sn) return;
    try {
      const { data } = await api.get("/warranty/status", { params: { serial: sn } });
      if (data?.status && data.status !== "NOT_FOUND") {
        if (confirm("Для этого серийного уже есть гарантийный талон. Открыть страницу покупателя?")) {
          router.push(`/buyer?sn=${encodeURIComponent(sn)}`);
        }
      }
    } catch {
      /* ignore */
    }
  }

  // 🚀 Отправка формы
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serial.trim()) return alert("Введите серийный номер");
    if (photos.length === 0) return alert("Загрузите хотя бы одно фото");

    setSending(true);
    setResult(null);

    try {
      // Доп. проактивная проверка перед POST (на случай, если пользователь не ушёл с поля)
      try {
        const { data: s } = await api.get("/warranty/status", { params: { serial: serial.trim() } });
        if (s?.status && s.status !== "NOT_FOUND") {
          if (confirm("Для этого серийного уже есть гарантийный талон. Открыть страницу покупателя?")) {
            router.push(`/buyer?sn=${encodeURIComponent(serial.trim())}`);
          }
          return;
        }
      } catch {
        /* ignore */
      }

      const body = {
        serial: serial.trim(),
        installerName: installerPhone,
        note: note.trim() || undefined,
        photos, // массив dataURL (base64)
      };

      const { data } = await api.post("/installer/confirm", body, {
        headers: { "Content-Type": "application/json" },
      });
      setResult(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Не удалось отправить данные";
      alert(msg);
    } finally {
      setSending(false);
    }
  }

  // ✅ (8) Аккуратно закрывать камеру при размонтировании страницы
  useEffect(() => {
    return () => {
      try {
        const videos = document.querySelectorAll("video");
        const tracks = Array.from(videos).flatMap((v) => {
          // @ts-ignore
          const so = (v as any).srcObject;
          return so?.getTracks?.() || [];
        });
        tracks.forEach((t) => t.stop());
      } catch {
        /* ignore */
      }
    };
  }, []);

  // Поддержка: не у всех устройств есть камера/доступ
  const canScan =
    typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image
                src="/sonmar-logo.webp"
                alt="SONMAR"
                width={140}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </Link>
            <span className="text-slate-600 font-semibold">Монтажник</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{installerPhone}</span>
            <button
              onClick={logout}
              className="px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-100 text-sm"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Подтверждение монтажа оборудования
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-2xl p-8 space-y-6"
        >
          {/* ✅ (13 + 6) label + id для доступности */}
          <div>
            <label htmlFor="serial" className="block text-sm font-medium text-gray-700 mb-1">
              Серийный номер насоса *
            </label>
            <div className="flex gap-2 items-center">
              <input
                id="serial"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                onBlur={handleSerialBlur} // ✅ (12)
                placeholder="Например, SN123456"
                disabled={sending}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setScanOpen(true)}
                disabled={!canScan || sending}
                title={canScan ? "" : "Сканер не поддерживается этим устройством"}
                className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50 text-sm disabled:opacity-60"
              >
                Сканер
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Можно ввести вручную или отсканировать QR.
            </p>
          </div>

          <div>
            <label htmlFor="photos" className="block text-sm font-medium text-gray-700 mb-2">
              Фото установки (до 5 файлов) *
            </label>
            <input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              disabled={sending}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0 file:text-sm
                         file:font-semibold file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100"
            />

            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p}
                      alt={`Фото ${i + 1}`}
                      className="rounded-lg border object-cover max-h-40 w-full"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-white/80 hover:bg-white text-slate-700 border rounded px-1.5 py-0.5 text-xs"
                      aria-label="Удалить фото"
                      title="Удалить фото"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Примечание
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Например: Проверено, установлено, утечек нет"
              rows={3}
              disabled={sending}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* ✅ (4) блокировка кнопки при отправке */}
          <button
            type="submit"
            disabled={sending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {sending ? "Отправка..." : "Подтвердить монтаж"}
          </button>
        </form>

        {result && (
          <div className="mt-10 bg-green-50 border border-green-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-green-700 mb-2">
              Монтаж подтверждён
            </h2>
            <p className="text-green-800 mb-1">
              Статус талона: <strong>{result.status}</strong>
            </p>
            {result.activationDate && (
              <p className="text-green-800">
                Активация через 14 дней:{" "}
                {new Date(result.activationDate).toLocaleDateString()}
              </p>
            )}
            <div className="mt-3">
              <Link
                href={`/buyer?sn=${encodeURIComponent(serial)}`}
                className="text-blue-600 hover:underline"
              >
                Перейти к странице покупателя
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Модалка со сканером */}
      {scanOpen && (
        <QrScanner onDecode={handleDecoded} onClose={() => setScanOpen(false)} />
      )}
    </div>
  );
}
