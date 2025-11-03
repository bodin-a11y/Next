// pages/installer.tsx
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export default function InstallerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Head>
        <title>Монтажник — SONMAR</title>
        <meta
          name="description"
          content="Раздел монтажника SONMAR: завершение оформления гарантийного талона на пусконаладке, серийные номера и фото установки."
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
                  Монтажник
                </h1>
                <p className="text-4xl sm:text-5xl font-bold text-blue-600 mb-4">
                  Пусконаладка и завершение гарантии
                </p>
                <p className="text-lg sm:text-xl text-gray-600 mb-8">
                  Завершите оформление талона на пусконаладке: добавьте серийные номера, фото установки,
                  дату запуска и комментарии. Администраторы талоны не подтверждают — статусы меняются автоматически.
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
                  Доступ монтажнику выдаёт активированный менеджер: он передаёт код и подтверждает регистрацию в PlanFix.
                </p>
              </div>

              <div aria-hidden="true" className="hidden lg:block" />
            </div>
          </div>
        </section>

        {/* Действия монтажника */}
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
                title="Завершить оформление (ПНР)"
                text="Откройте талон и завершите пусконаладку: дата запуска, комментарии, отметка о готовности."
                href="/installer/commissioning"
                gradient="from-blue-500 to-blue-600"
              />
              <Card
                title="Добавить серийные номера"
                text="Укажите серийные номера насоса и сопутствующего оборудования."
                href="/installer/serials"
                gradient="from-cyan-500 to-cyan-600"
              />
              <Card
                title="Загрузить фото установки"
                text="Загрузите фото монтажа. Изображения автоматически сжимаются до разумного размера."
                href="/installer/photos"
                gradient="from-teal-500 to-teal-600"
              />
              <Card
                title="Проверить статус талона"
                text="Проверьте, на каком этапе талон: Черновик, Ожидает активации (14 дней), Активен."
                href="/installer/status"
                gradient="from-indigo-500 to-indigo-600"
              />
              <Card
                title="Инструкции по монтажу"
                text="Ссылки на инструкции и руководства по установке для моделей насосов."
                href="/instruction"
                gradient="from-slate-600 to-slate-700"
              />
              <Card
                title="Связаться с поддержкой"
                text="Оставьте обращение в сервис или уточните детали по установке."
                href="/request"
                gradient="from-rose-500 to-rose-600"
              />
            </div>
          </div>
        </section>

        {/* Как это работает */}
        <section id="steps" className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
              Как это работает (монтажник)
            </h3>
            <div className="grid md:grid-cols-2 gap-10 items-start">
              <ol className="space-y-4 text-gray-700">
                <li><b>1.</b> Получите доступ от менеджера (продавца): он передаёт код и подтверждает регистрацию в PlanFix.</li>
                <li><b>2.</b> Откройте талон клиента и завершите ПНР: дата запуска, серийные номера, фото установки, комментарии.</li>
                <li><b>3.</b> После оформления у талона может быть статус <i>Ожидает активации</i> — идёт 14-дневный период возврата.</li>
                <li><b>4.</b> Если возврат оформлен — талон откатывается в <i>Черновик</i>. Если нет — переходит в <i>Активен</i>, бонусы начисляются автоматически.</li>
              </ol>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Роли и интеграции</h4>
                <ul className="space-y-2 text-gray-700">
                  <li><b>Bot</b> — интерфейс (web/mini-app).</li>
                  <li><b>n8n</b> — логика/таймеры (14 дней), обмен с PlanFix/1С/ThingsBoard.</li>
                  <li><b>PlanFix</b> — база данных и отчётность (в т.ч. по монтажникам).</li>
                  <li><b>1С</b> — выплаты и бухгалтерия.</li>
                  <li><b>ThingsBoard</b> — позже: автоактивация при первом подключении.</li>
                </ul>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/installer/commissioning" legacyBehavior>
                    <a className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition focus:outline-none focus:ring-4 focus:ring-blue-300">
                      Перейти к ПНР
                    </a>
                  </Link>
                  <Link href="/installer/serials" legacyBehavior>
                    <a className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-slate-700 font-semibold border border-slate-200 shadow-sm hover:bg-slate-50 transition focus:outline-none focus:ring-4 focus:ring-slate-200">
                      Серийные номера
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
                <li><Link href="/seller" legacyBehavior><a className="hover:text-white transition">Продавец</a></Link></li>
                <li><Link href="/buyer" legacyBehavior><a className="hover:text-white transition">Покупатель</a></Link></li>
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
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </a>
    </Link>
  );
}
