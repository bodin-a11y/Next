import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const roles = [
    {
      title: 'Покупатель',
      description: 'Регистрация и управление вашими гарантийными талонами',
      icon: '🛒',
      href: '/buyer',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Продавец',
      description: 'Подтверждение продажи и активация гарантийных талонов',
      icon: '🏪',
      href: '/seller',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: 'Монтажник',
      description: 'Подтверждение монтажа и активация расширенной гарантии',
      icon: '🔧',
      href: '/installer',
      color: 'from-teal-500 to-teal-600'
    },
    {
      title: 'Администратор',
      description: 'Управление системой и мониторинг гарантийных талонов',
      icon: '⚙️',
      href: '/admin',
      color: 'from-slate-600 to-slate-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image 
                src="/sonmar-logo.webp" 
                alt="SONMAR Logo" 
                width={150} 
                height={40}
                style={{ height: 'auto' }}
                className="h-10"
              />
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition">О системе</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition">Контакты</a>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Система гарантийных талонов
                <span className="block text-blue-600 mt-2">насосов SONMAR</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
                Современная платформа для регистрации, подтверждения и управления гарантийными талонами
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white px-6 py-3 rounded-lg shadow-md">
                  <span className="text-sm text-gray-500">Быстро</span>
                  <p className="text-2xl font-bold text-blue-600">⚡</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-lg shadow-md">
                  <span className="text-sm text-gray-500">Надежно</span>
                  <p className="text-2xl font-bold text-blue-600">🔒</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-lg shadow-md">
                  <span className="text-sm text-gray-500">Удобно</span>
                  <p className="text-2xl font-bold text-blue-600">✨</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
              Выберите свою роль
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Войдите в систему, выбрав соответствующую роль для доступа к функционалу
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roles.map((role, index) => (
                <Link key={index} href={role.href}>
                  <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2">
                    <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <div className="p-8">
                      <div className="text-5xl mb-4">{role.icon}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{role.title}</h3>
                      <p className="text-gray-600 mb-6">{role.description}</p>
                      <div className={`inline-flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform`}>
                        Войти
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Преимущества системы
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Простая регистрация</h3>
                      <p className="text-gray-600">Быстрое оформление гарантийных талонов онлайн</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Прозрачный процесс</h3>
                      <p className="text-gray-600">Отслеживание статуса в реальном времени</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Безопасность данных</h3>
                      <p className="text-gray-600">Надежное хранение информации о гарантии</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Качество SONMAR</h3>
                  <p className="text-gray-600">Мы обеспечиваем высокий уровень сервиса и поддержки наших клиентов на всех этапах</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Image 
                src="/sonmar-logo.webp" 
                alt="SONMAR Logo" 
                width={150} 
                height={40}
                style={{ height: 'auto' }}
                className="h-8 mb-4 brightness-0 invert"
              />
              <p className="text-gray-400">Надежные насосы для вашего дома и бизнеса</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <p className="text-gray-400">Email: info@sonmar.com</p>
              <p className="text-gray-400">Телефон: +7 (xxx) xxx-xx-xx</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ссылки</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">О компании</a></li>
                <li><a href="#" className="hover:text-white transition">Продукция</a></li>
                <li><a href="#" className="hover:text-white transition">Поддержка</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SONMAR by PRODIN. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
