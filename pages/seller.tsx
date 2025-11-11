// pages/seller.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useAuth } from "../lib/auth-context";
import { api } from "../lib/api";

type QrScannerProps = {
  onDecode: (text: string) => void;
  onClose: () => void;
};

// Сканер грузим только на клиенте
const QrScanner = dynamic<QrScannerProps>(
  () => import("../features/buyer/common/QrScanner").then((m) => m.default),
  { ssr: false }
);

export default function SellerPage() {
  const router = useRouter();
  const { profile, loading, logout } = useAuth();

  const [serial, setSerial] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(() =>
    new Date().toISOString().substring(0, 10)
  );
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scanOpen, setScanOpen] = useState(false); // ⬅️ МОДАЛКА СКАНЕРА

  const canScan =
    typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  // 🔒 защита по роли
  useEffect(() => {
    if (!loading) {
      if (!profile || profile.role !== "seller") {
        router.replace("/login?role=seller");
      }
    }
  }, [loading, profile, router]);

  if (!profile || profile.role !== "seller") {
    return null;
  }

  // 📸 загрузка + проверка файла
  function guardImage(file: File) {
    const okType = /^image\/(jpeg|jpg|png|webp)$/i.test(file.type);
    if (!okType) throw new Error("Допустимы JPG/PNG/WebP");
    if (file.size > 8 * 1024 * 1024) throw new Error("Файл больше 8 МБ");
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      guardImage(file);
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(err.message);
    }
  }

  // ✅ автопроверка: если талон уже есть — предложить открыть buyer
  async function handleBlur() {
    if (!serial.trim()) return;
    try {
      const { data } = await api.get("/warranty/status", {
        params: { serial: serial.trim() },
      });
      if (data?.status && data.status !== "NOT_FOUND") {
        if (confirm("Для этого серийного уже есть гарантийный талон. Перейти к странице покупателя?")) {
          router.push(`/buyer?sn=${encodeURIComponent(serial.trim())}`);
        }
      }
    } catch { /* ignore */ }
  }

  // 🔍 результат сканера: URL или простой SN
  function handleDecoded(text: string) {
    try {
      const url = new URL(text);
      const sn = url.searchParams.get("sn");
      if (sn) {
        setScanOpen(false);
        setSerial(sn);
        return;
      }
    } catch { /* не URL */ }
    const plain = text.trim();
    if (plain) {
      setScanOpen(false);
      setSerial(plain);
    }
  }

  // 🚀 отправка формы
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serial.trim()) return alert("Введите серийный номер");
    if (!receiptFile) return alert("Загрузите фото чека");

    // проверка даты
    if (new Date(purchaseDate).getTime() > Date.now()) {
      return alert("Дата продажи не может быть в будущем");
    }

    setSending(true);
    setResult(null);

    try {
      const receiptBase64 = preview ?? "";
      const body = {
        serial: serial.trim(),
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        purchaseDate,
        receiptBase64,
      };

      const { data } = await api.post("/seller/create", body, {
        headers: { "Content-Type": "application/json" },
      });

      setResult(data);
    } catch (err: any) {
      alert(err.message || "Не удалось создать талон");
    } finally {
      setSending(false);
    }
  }

  // аккуратно закрывать камеру при размонтировании
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
      } catch { /* ignore */ }
    };
  }, []);

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
              />
            </Link>
            <span className="text-slate-600 font-semibold">Продавец</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{profile.phone}</span>
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
          Оформление гарантийного талона
        </h1>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-8 space-y-6">
          <div>
            <label htmlFor="serial" className="block text-sm font-medium text-gray-700 mb-1">
              Серийный номер насоса *
            </label>
            <div className="flex gap-2 items-center">
              <input
                id="serial"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                onBlur={handleBlur}
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
            <p className="text-xs text-slate-500 mt-1">Можно ввести вручную или отсканировать QR.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                Имя покупателя
              </label>
              <input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={sending}
                placeholder="Иван Иванов"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Телефон покупателя
              </label>
              <input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                disabled={sending}
                placeholder="+380..."
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
              Дата продажи
            </label>
            <input
              id="purchaseDate"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              disabled={sending}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="receiptFile" className="block text-sm font-medium text-gray-700 mb-2">
              Фото чека *
            </label>
            <input
              id="receiptFile"
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={sending}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0 file:text-sm
                         file:font-semibold file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100"
            />
            {preview && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Предпросмотр:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Чек" className="max-h-64 rounded-lg border" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {sending ? "Отправка..." : "Создать талон"}
          </button>
        </form>

        {result && (
          <div className="mt-10 bg-green-50 border border-green-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-green-700 mb-2">Талон успешно создан</h2>
            <p className="text-green-800 mb-1">
              Статус: <strong>{result.status}</strong>
            </p>
            {result.activationDate && (
              <p className="text-green-800">
                Активация через 14 дней: {new Date(result.activationDate).toLocaleDateString()}
              </p>
            )}
            <div className="mt-3">
              <Link href={`/buyer?sn=${encodeURIComponent(serial)}`} className="text-blue-600 hover:underline">
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
