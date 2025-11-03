// pages/seller.tsx
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export default function SellerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Head>
        <title>Продавец — SONMAR</title>
        <meta
          name="description"
          content="Раздел продавца SONMAR: оформление гарантийного талона (скан или вручную), загрузка чека, статус талона и возврат."
        />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" legacyBehavior>
                <a className="inline-flex items-center gap-3 group">
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
                </a>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition">
                Главная
              </Link>
              <a href="#actions" className="text-gray-600 hover:text-blue-600 transition">
                Действия
              </a>
              <a href="#steps" className="text-gray-600 hover:text-blue-600 transition">
                Как это работает
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
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                  Продавец
                </h1>
                <p className="text-4xl sm:text-5xl font-bold text-blue-600 mb-4">
                  Оформление гарантии SONMAR
                </p>
                <p className="text-lg sm:text-xl text-gray-600 mb-8">
                  Оформляйте гарантийные талоны (сканом QR или вручную), загружайте чек,
                  при необходимости создавайте возврат и отслеживайте статус — всё в одном месте.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link href="#actions" legacyBehavior>
                    <a className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition focus:outline-none focus:ring-4 focus:ring-blue-300">
                      Перейти к действиям
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </Link>
                  <Link href="#steps" legacyBehavior>
                    <a className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 shadow-sm hover:bg-slate-50 transition focus:outline-none focus:ring-4 focus:ring-slate-200">
                      Как это работает
                    </a>
                  </Link>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  Доступ выдаётся после подтверждения вашей регистрации руководителем компании (в PlanFix).
                  Администраторы талоны не подтверждают — активация происходит автоматически по правилам.
                </p>
              </div>

              <div aria-hidden="true" className="hidden lg:block" />
            </div>
          </div>
        </section>

        {/* Действия продавца */}
        <section id="actions" className="py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">
              Что вы хотите сделать?
            </h2>
            <p className="text-center text-gray-600 mb-10">
              Выберите действие. При необходимости — вернётесь назад в любой момент.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <Card
                title="Оформить талон (скан QR)"
                text="Отсканируйте QR на насосе и заполните недостающие поля. Чек — обязателен."
                href="/warranty"            // одна форма, вариант «скан» выбираем внутри
                gradient="from-blue-500 to-blue-600"
              />
              <Card
                title="Оформить талон (вручную)"
                text="Нет доступа к насосу? Введите данные вручную. Клиент может прислать фото QR."
                href="/seller/manual"       // заглушка-роут, создадим позже или поведём в /warranty? на твой выбор
                gradient="from-cyan-500 to-cyan-600"
              />
              <Card
                title="Загрузить чек"
                text="Загрузите фото чека (будет автоматически сжато) и привяжите к талону."
                href="/seller/receipt"      // заглушка-роут под аплоад
                gradient="from-teal-500 to-teal-600"
              />
              <Card
                title="Проверить статус талона"
                text="Узнайте, на каком этапе талон: Черновик, Ожидает активации, Активен."
                href="/seller/status"       // заглушка-роут под поиск/статус
                gradient="from-indigo-500 to-indigo-600"
              />
              <Card
                title="Оформить возврат"
                text="Вернуть товар? Талон откатится в Черновик. Бонусы не начисляются."
                href="/seller/return"       // заглушка-роут под возврат
                gradient="from-rose-500 to-rose-600"
              />
              <Card
                title="Инструкции для клиента"
                text="Быстрая ссылка для скачивания инструкции к модели насоса."
                href="/instruction"
                gradient="from-slate-600 to-slate-700"
              />
            </div>
          </div>
        </section>

        {/* Как это работает */}
        <section id="steps" className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
              Как это работает (продавец)
            </h3>
            <div className="grid md:grid-cols-2 gap-10 items-start">
              <ol className="space-y-4 text-gray-700">
                <li><b>1.</b> Авторизуйтесь. Доступ подтверждает руководитель вашей компании в PlanFix.</li>
                <li><b>2.</b> Оформите талон: сканируйте QR или создайте вручную. <b>Чек обязателен</b> (будет сжат).</li>
                <li><b>3.</b> Статус: <i>Черновик</i> → после подтверждения QR/чека — <i>Ожидает активации</i> (14 дней).</li>
                <li><b>4.</b> Если возврат — используйте «Оформить возврат»: талон откатывается в <i>Черновик</i>.</li>
                <li><b>5.</b> По истечении 14 дней без возврата талон становится <i>Активен</i>, бонус начисляется автоматически.</li>
              </ol>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Подсказка</h4>
                <p className="text-gray-700">
                  Если на месте нет насоса, попросите клиента прислать фото QR. Дату продажи можно скорректировать —
                  приоритет у даты из чека.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/warranty" legacyBehavior>
                    <a className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition focus:outline-none focus:ring-4 focus:ring-blue-300">
                      Начать оформление
                    </a>
                  </Link>
                  <Link href="/seller/return" legacyBehavior>
                    <a className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-slate-700 font-semibold border border-slate-200 shadow-sm hover:bg-slate-50 transition focus:outline-none focus:ring-4 focus:ring-slate-200">
                      Оформить возврат
                    </a>
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
                <li><Link href="/" legacyBehavior><a className="hover:text-white transition">Главная</a></Link></li>
                <li><Link href="/buyer" legacyBehavior><a className="hover:text-white transition">Покупатель</a></Link></li>
                <li><Link href="/admin" legacyBehavior><a className="hover:text-white transition">Администратор</a></Link></li>
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

type CardProps = {
  title: string;
  text: string;
  href: string;
  gradient: string;
};

function Card({ title, text, href, gradient }: CardProps) {
  return (
    <Link href={href} legacyBehavior>
      <a
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
      </a>
    </Link>
  );
}
