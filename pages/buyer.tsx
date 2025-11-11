// pages/buyer.tsx
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

import { api } from "../lib/api";
import type {
  WarrantyStatusResponse,
  WarrantyRequestPayload,
  SupportPayload,
} from "../types/warranty";

type QrScannerProps = {
  onDecode: (text: string) => void;
  onClose: () => void;
};

// Сканер камеры грузим только на клиенте
const QrScanner = dynamic<QrScannerProps>(
  () => import("../features/buyer/common/QrScanner").then((m) => m.default),
  { ssr: false }
);

export default function BuyerPage() {
  const router = useRouter();

  // sn из URL (если пришли по QR: /buyer?sn=XXXX)
  const snFromUrl = useMemo(
    () => (typeof router.query.sn === "string" ? router.query.sn : ""),
    [router.query.sn]
  );

  const [serial, setSerial] = useState(snFromUrl || "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WarrantyStatusResponse | null>(null);

  const [showRequest, setShowRequest] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const status = data?.status;

  // Если пришли уже с ?sn=... — сразу грузим статус
  useEffect(() => {
    if (snFromUrl) {
      setSerial(snFromUrl);
      void fetchStatus(snFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snFromUrl]);

  async function fetchStatus(sn: string) {
    setLoading(true);
    try {
      const { data } = await api.get<WarrantyStatusResponse>("/warranty/status", {
        params: { serial: sn },
      });
      setData(data);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function submitRequest(p: WarrantyRequestPayload) {
    await api.post("/warranty/request", p, {
      headers: { "Content-Type": "application/json" },
    });
    setShowRequest(false);
    await fetchStatus(p.serial);
    alert("Заявка отправлена. Статус — Черновик.");
  }

  async function submitSupport(p: SupportPayload) {
    await api.post("/warranty/support", p, {
      headers: { "Content-Type": "application/json" },
    });
    setShowSupport(false);
    alert("Обращение отправлено. Мы свяжемся с вами.");
  }

  // Обработка результата сканера
  function handleDecoded(text: string) {
    // В QR может быть URL (/buyer?sn=...), либо просто серийник
    try {
      const url = new URL(text);
      const sn = url.searchParams.get("sn");
      if (sn) {
        setScanOpen(false);
        setSerial(sn);
        fetchStatus(sn);
        return;
      }
    } catch {
      // не URL — просто строка
    }
    const plain = text.trim();
    if (plain) {
      setScanOpen(false);
      setSerial(plain);
      fetchStatus(plain);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Head>
        <title>Покупатель — SONMAR</title>
        <meta
          name="description"
          content="Регистрация гарантийного талона, инструкции и поддержка"
        />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <Image
                src="/sonmar-logo.webp"
                alt="SONMAR"
                width={120}
                height={32}
                className="h-8 w-auto"
                priority
              />
              <span className="text-sm text-gray-500 group-hover:text-gray-700 transition">
                На главную
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600 transition"
              >
                Главная
              </Link>
              <a
                href="#actions"
                className="text-gray-600 hover:text-blue-600 transition"
              >
                Действия
              </a>
              <a
                href="#status"
                className="text-gray-600 hover:text-blue-600 transition"
              >
                Статус
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10"
            aria-hidden="true"
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
              Покупатель
            </h1>
            <p className="text-4xl sm:text-5xl font-bold text-blue-600 mb-6">
              Гарантия и поддержка SONMAR
            </p>
            <p className="text-lg sm:text-xl text-gray-600 mb-6">
              Введите серийный номер с QR-кода или откройте страницу по QR. Мы
              покажем статус гарантии и нужные действия.
            </p>

            {/* Ввод серийного номера + сканер */}
            <div className="flex flex-wrap gap-3 items-center">
              <input
                className="w-72 max-w-full border rounded-lg px-3 py-2 bg-white"
                placeholder="SN123456"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
              />
              <button
                onClick={() => serial && fetchStatus(serial)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                disabled={!serial}
              >
                Проверить статус
              </button>
              <button
                onClick={() => setScanOpen(true)}
                className="px-4 py-2 rounded-lg bg-white border font-semibold hover:bg-slate-50 transition"
              >
                Сканировать QR
              </button>
            </div>
          </div>
        </section>

        {/* Статус */}
        <section id="status" className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <StatusCard data={data} loading={loading} />
          </div>
        </section>

        {/* Действия */}
        <section id="actions" className="py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Actions
              showInstruction={true}
              showDownload={status === "ACTIVE"}
              warrantyPdf={data?.warrantyPdf}
              onCreateRequest={
                status === "NOT_FOUND" ? () => setShowRequest(true) : undefined
              }
              onSupport={() => setShowSupport(true)}
            />
          </div>
        </section>

        {/* Формы по требованию */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mb-10">
          {showRequest && serial && (
            <WarrantyRequestForm
              serial={serial}
              onSubmit={submitRequest}
              onCancel={() => setShowRequest(false)}
            />
          )}

          {showSupport && (
            <SupportForm
              serial={serial}
              status={status}
              onSubmit={submitSupport}
              onCancel={() => setShowSupport(false)}
            />
          )}
        </div>

        {/* Модалка со сканером */}
        {scanOpen && (
          <QrScanner
            onDecode={handleDecoded}
            onClose={() => setScanOpen(false)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Image
                src="/sonmar-logo.webp"
                alt="SONMAR"
                width={150}
                height={40}
                className="h-8 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-gray-400">
                Надёжные насосы для вашего дома и бизнеса
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <p className="text-gray-400">Email: info@sonmar.com.ua</p>
              <p className="text-gray-400">Телефон: +38 (xxx) xxx-xx-xx</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Навигация</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white transition">
                    Главная
                  </Link>
                </li>
                <li>
                  <Link href="/seller" className="hover:text-white transition">
                    Продавец
                  </Link>
                </li>
                <li>
                  <Link
                    href="/installer"
                    className="hover:text-white transition"
                  >
                    Монтажник
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SONMAR. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Импортируем компоненты из фичи-пакета внизу, чтобы код выглядел компактнее
import {
  Actions,
  StatusCard,
  SupportForm,
  WarrantyRequestForm,
} from "../features/buyer";
