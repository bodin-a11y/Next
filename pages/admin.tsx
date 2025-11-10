// pages/admin.tsx
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../lib/auth-context";

type CardProps = {
  title: string;
  text: string;
  href: string;
  gradient: string;
};

function Card({ title, text, href, gradient }: CardProps) {
  return (
    <Link
      href={href}
      className="group relative block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-blue-300"
      aria-label={title}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
        aria-hidden="true"
      />
      <div className="p-7">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-5">{text}</p>
        <span className="inline-flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
          Перейти
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { profile, loading, logout } = useAuth();

  // 🔒 защита по роли admin
  useEffect(() => {
    if (!loading) {
      if (!profile || profile.role !== "admin") {
        router.replace("/login?role=admin");
      }
    }
  }, [loading, profile, router]);

  if (!profile || profile.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Head>
        <title>Администратор — SONMAR</title>
        <meta
          name="description"
          content="Раздел администратора SONMAR: пользователи, отчёты и выплаты, интеграции n8n/PlanFix/1C/ThingsBoard, мониторинг возвратов и статусов."
        />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <Image
                  src="/sonmar-logo.webp"
                  alt="SONMAR"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                  priority
                  sizes="120px"
                />
                <span className="text-sm text-gray-500 group-hover:text-gray-700 transition">
                  На главную
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">{profile?.login || "admin"}</span>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 text-sm"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Администратор</h1>
                <p className="text-4xl sm:text-5xl font-bold text-blue-600 mb-4">Управление системой SONMAR</p>
                <p className="text-lg sm:text-xl text-gray-600 mb-8">
                  Пользователи и роли, отчёты и выплаты, интеграции с n8n/PlanFix/1C/ThingsBoard, мониторинг возвратов и статусов.
                  <br />
                  <b>Внимание:</b> администраторы <u>не подтверждают</u> гарантийные талоны — активация происходит автоматически по правилам.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="#actions"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition focus:outline-none focus:ring-4 focus:ring-blue-300"
                  >
                    Перейти к действиям
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="#steps"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 shadow-sm hover:bg-slate-50 transition focus:outline-none focus:ring-4 focus:ring-slate-200"
                  >
                    Как это работает
                  </Link>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Доступ только для уполномоченных администраторов SONMAR.
                </p>
              </div>
              <div aria-hidden="true" className="hidden lg:block" />
            </div>
          </div>
        </section>

        {/* Действия администратора */}
        <section id="actions" className="py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3см font-bold text-gray-900 text-center mb-3">Действия администратора</h2>
            <p className="text-center text-gray-600 mb-10">
              Управляйте ключевыми аспектами платформы. Подтверждение талонов здесь не требуется — статусы меняются автоматически.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <Card
                title="Пользователи и роли"
                text="Создание и управление продавцами и монтажниками, смена статусов и доступов."
                href="/admin/users"
                gradient="from-blue-500 to-blue-600"
              />

              <Card
                title="Возвраты и статусы"
                text="Мониторинг возвратов. Контроль корректного отката статуса талона в Черновик."
                href="/admin/returns"
                gradient="from-indigo-500 to-indigo-600"
              />

              <Card
                title="Аудит событий"
                text="Журнал действий: кто и когда создал, изменил или инициировал возврат."
                href="/admin/audit"
                gradient="from-rose-500 to-rose-600"
              />
            </div>
          </div>
        </section>

        {/* Как это работает (для админа) */}
        <section id="steps" className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
              Как устроена логика (кратко)
            </h3>
            <div className="grid md:grid-cols-2 gap-10 items-start">
              <ol className="space-y-4 text-gray-700">
                <li><b>1.</b> QR ведёт на веб-форму с ролями: Инструкция, Гарантийный талон, Оформить заявку на гар. талон, Я продавец, Я монтажник.</li>
                <li><b>2.</b> Продавец оформляет талон (скан QR или вручную) и загружает чек. Дата по умолчанию — текущая, можно изменить на дату чека.</li>
                <li><b>3.</b> Монтажник завершает оформление на пусконаладке (серийники, фото установки).</li>
                <li><b>4.</b> Статусы: Черновик → Ожидает активации (идёт 14 дней) → Активен. Возврат откатывает в Черновик.</li>
                <li><b>5.</b> Бонусы начисляются автоматически при переходе в «Активен». Отчёты формирует PlanFix, выплаты — через 1С.</li>
              </ol>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Роли систем</h4>
                <ul className="space-y-2 text-gray-700">
                  <li><b>Bot</b> — интерфейс (web/mini-app).</li>
                  <li><b>n8n</b> — логика и интеграции/таймеры (14 дней), вебхуки.</li>
                  <li><b>PlanFix</b> — база данных и отчётность по менеджерам и монтажникам.</li>
                  <li><b>1С</b> — финансы и выплаты.</li>
                  <li><b>ThingsBoard</b> — IoT/автоактивация при первом подключении (позже).</li>
                </ul>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/admin/integrations"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition focus:outline-none focus:ring-4 focus:ring-blue-300"
                  >
                    Открыть интеграции
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-slate-700 font-semibold border border-slate-200 shadow-sm hover:bg-slate-50 transition focus:outline-none focus:ring-4 focus:ring-slate-200"
                  >
                    Правила и таймеры
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-white py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Image
                src="/sonmar-logo.webp"
                alt="SONMAR"
                width={150}
                height={40}
                className="h-8 w-auto mb-4 brightness-0 invert"
                sizes="150px"
              />
              <p className="text-gray-400">Надёжные насосы для вашего дома и бизнеса</p>
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
                  <Link href="/" className="hover:text-white transition">Главная</Link>
                </li>
                <li>
                  <Link href="/buyer" className="hover:text-white transition">Покупатель</Link>
                </li>
                <li>
                  <Link href="/seller" className="hover:text-white transition">Продавец</Link>
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
