// pages/login.tsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

// Утилиты и типы для временных пользователей
import {
  Role,
  seedUsersOnce,
  upsertUser,
  findUserByRoleAndKey,
  setCurrentUser,
} from "../data/users";

type Mode = "login" | "register";

const INVITE_CODE_DEMO = "0000"; // демо-код подтверждения

export default function LoginPage() {
  const router = useRouter();

  // Если роль передана в query (?role=seller|installer|admin) — интерфейс "залочен" на неё
  const queryRole = useMemo<Role | undefined>(() => {
    const q = router.query.role as string | undefined;
    return q === "seller" || q === "installer" || q === "admin" ? (q as Role) : undefined;
  }, [router.query.role]);
  const isLockedRole = !!queryRole;

  // Локальное состояние выбранной роли и режима (у админа регистрации нет)
  const [role, setRole] = useState<Role>(queryRole ?? "seller");
  const [mode, setMode] = useState<Mode>(() => {
    const q = (router.query.mode as string) || "login";
    return q === "register" ? "register" : "login";
  });

  const [loading, setLoading] = useState(false);

  // Общие поля для продавца/монтажника
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Код подтверждения при регистрации продавца/монтажника
  const [inviteCode, setInviteCode] = useState("");

  // Поля для администратора
  const [adminLogin, setAdminLogin] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Один раз "засеять" тестовые аккаунты в localStorage
  useEffect(() => {
    seedUsersOnce();
  }, []);

  // Держим URL в актуальном виде (удобно делиться ссылкой и возвращаться назад)
  useEffect(() => {
    const url = `/login${isLockedRole ? `?role=${role}` : `?role=${role}&mode=${mode}`}`;
    router.replace(url, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, mode]);

  // Редирект после успешной аутентификации
  function goAfterAuth(r: Role) {
    if (r === "seller") return router.push("/seller");
    if (r === "installer") return router.push("/installer");
    return router.push("/admin");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Вход администратора (регистрации для админа нет в UI)
      if (role === "admin") {
        if (!adminLogin.trim() || !adminPassword.trim()) {
          alert("Введите логин и пароль администратора");
          return;
        }
        const exists = findUserByRoleAndKey("admin", adminLogin.trim());
        if (!exists) {
          // Разрешим создать демо-аккаунт админа при первом входе
          upsertUser({ role: "admin", login: adminLogin.trim(), password: adminPassword.trim() });
          setCurrentUser({ role: "admin", login: adminLogin.trim() });
          return goAfterAuth("admin");
        }
        if (exists.password !== adminPassword.trim()) {
          alert("Неверный пароль администратора");
          return;
        }
        setCurrentUser({ role: "admin", login: adminLogin.trim() });
        return goAfterAuth("admin");
      }

      // Продавец / Монтажник
      if (mode === "register") {
        // Регистрация: имя + фамилия + телефон + код (в зависимости от роли)
        if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
          alert("Введите имя, фамилию и телефон");
          return;
        }
        if (!inviteCode.trim()) {
          alert("Введите код подтверждения");
          return;
        }
        if (inviteCode.trim() !== INVITE_CODE_DEMO) {
          alert("Неверный код. Для демо используйте: " + INVITE_CODE_DEMO);
          return;
        }

        upsertUser({
          role,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
        });

        setCurrentUser({
          role,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
        });

        return goAfterAuth(role);
      } else {
        // Вход: имя + фамилия + телефон (без кода)
        if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
          alert("Введите имя, фамилию и телефон");
          return;
        }

        const found = findUserByRoleAndKey(role, phone.trim());
        if (!found) {
          alert("Пользователь не найден. Пожалуйста, зарегистрируйтесь.");
          return;
        }

        const okName =
          (found.firstName || "").toLowerCase() === firstName.trim().toLowerCase() &&
          (found.lastName || "").toLowerCase() === lastName.trim().toLowerCase();

        if (!okName) {
          alert("Имя/фамилия не совпадают с зарегистрированными");
          return;
        }

        setCurrentUser({
          role,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
        });

        return goAfterAuth(role);
      }
    } finally {
      setLoading(false);
    }
  }

  const roleTitle =
    role === "seller" ? "Продавец" : role === "installer" ? "Монтажник" : "Администратор";

  // Подпись для поля кода при регистрации
  const codeLabel =
    role === "seller"
      ? "Код подтверждения дилера"
      : role === "installer"
      ? "Код подтверждения продавца"
      : "Код подтверждения";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/sonmar-logo.webp"
              alt="SONMAR"
              width={140}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition">
              ← На главную
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {roleTitle}: {role === "admin" ? "вход" : mode === "register" ? "регистрация" : "вход"}
            </h1>

            {isLockedRole && (
              <span>
                
              </span>
            )}
          </div>

          {/* Если роль НЕ зафиксирована в query — показываем табы ролей */}
          {!isLockedRole && (
            <div className="flex justify-center gap-4 mb-6">
              {(["seller", "installer", "admin"] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    if (r === "admin") setMode("login"); // у админа только вход
                  }}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 ${
                    role === r
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  } transition`}
                >
                  {r === "seller" && "Продавец"}
                  {r === "installer" && "Монтажник"}
                  {r === "admin" && "Администратор"}
                </button>
              ))}
            </div>
          )}

          {/* Переключатель Вход/Регистрация (только для продавца/монтажника) */}
          {role !== "admin" && (
            <div className="flex justify-center gap-4 mb-6">
              {(["login", "register"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
                    mode === m
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {m === "login" ? "Вход" : "Регистрация"}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Продавец / Монтажник */}
            {role !== "admin" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Имя
                    </label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Иван"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Фамилия
                    </label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Иванов"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+380..."
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {mode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {codeLabel}
                    </label>
                    <input
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Введите код (демо: 0000)"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}
              </>
            )}

            {/* Администратор */}
            {role === "admin" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Логин
                  </label>
                  <input
                    value={adminLogin}
                    onChange={(e) => setAdminLogin(e.target.value)}
                    placeholder="admin@sonmar.com.ua"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Пароль
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading
                ? "Подождите..."
                : role === "admin"
                ? "Войти как администратор"
                : mode === "register"
                ? `Завершить регистрацию (${role === "seller" ? "продавец" : "монтажник"})`
                : `Войти (${role === "seller" ? "продавец" : "монтажник"})`}
            </button>
          </form>

          {/* Быстрый переключатель Вход/Регистрация (для seller/installer) */}
          {role !== "admin" && (
            <div className="mt-6 text-center text-sm text-gray-500">
              {mode === "login" ? (
                <button
                  onClick={() => setMode("register")}
                  className="text-blue-600 hover:underline"
                >
                  Нет аккаунта? Зарегистрироваться
                </button>
              ) : (
                <button
                  onClick={() => setMode("login")}
                  className="text-blue-600 hover:underline"
                >
                  Уже есть аккаунт? Войти
                </button>
              )}
            </div>
          )}

          {/* Подсказка, если роль зафиксирована параметром */}
          {isLockedRole && (
            <p className="mt-4 text-center text-xs text-slate-500">
              Вы перешли как <b>{roleTitle.toLowerCase()}</b>. Смена роли недоступна на этой странице.
            </p>
          )}
        </div>
      </main>

      <footer className="text-center text-gray-400 text-sm pb-6">
        &copy; 2025 SONMAR. Все права защищены.
      </footer>
    </div>
  );
}
