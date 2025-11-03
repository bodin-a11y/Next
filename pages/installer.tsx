import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../lib/auth-context";

export default function InstallerPage() {
  const router = useRouter();
  const { profile, loading, logout } = useAuth();
  const [serial, setSerial] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 🔒 защита по роли
  useEffect(() => {
    if (!loading) {
      if (!profile || profile.role !== "installer") {
        router.replace("/login?role=installer");
      }
    }
  }, [loading, profile, router]);

  if (!profile || profile.role !== "installer") {
    return null;
  }

  // 📸 Загрузка нескольких фото
  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const fileArr = Array.from(files);

    fileArr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  // 🚀 Отправка формы
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serial.trim()) return alert("Введите серийный номер");
    if (photos.length === 0) return alert("Загрузите хотя бы одно фото");

    setSending(true);
    setResult(null);

    try {
      const body = {
        serial: serial.trim(),
        installerName: profile.phone,
        note: note.trim(),
        photos,
      };

      const res = await fetch("/api/installer/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка при отправке данных");

      setResult(data);
    } catch (err: any) {
      alert(err.message || "Не удалось отправить данные");
    } finally {
      setSending(false);
    }
  }

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
            <span className="text-slate-600 font-semibold">Монтажник</span>
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
          Подтверждение монтажа оборудования
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-2xl p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Серийный номер насоса *
            </label>
            <input
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Например, SN123456"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Фото установки (до 5 файлов) *
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0 file:text-sm
                         file:font-semibold file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100"
            />
            {photos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt={`Фото ${i + 1}`}
                    className="rounded-lg border object-cover max-h-40"
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Примечание
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Например: Проверено, установлено, утечек нет"
              rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
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
                href={`/buyer?sn=${serial}`}
                className="text-blue-600 hover:underline"
              >
                Перейти к странице покупателя
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
