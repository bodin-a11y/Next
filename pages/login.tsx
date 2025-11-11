// pages/login.tsx
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../lib/auth-context";

type Role = "seller" | "installer" | "admin";
type Mode = "login" | "register";
const INVITE_CODE_DEMO = "0000"; // демо-код

export default function LoginPage() {
  const router = useRouter();
  const { loading, loginAdmin, loginUser, registerSeller, registerInstaller } = useAuth();

  const queryRole = useMemo<Role | undefined>(() => {
    const q = router.query.role as string | undefined;
    return q === "seller" || q === "installer" || q === "admin" ? (q as Role) : undefined;
  }, [router.query.role]);
  const isLockedRole = !!queryRole;

  const [role, setRole] = useState<Role>(queryRole ?? "seller");
  const [mode, setMode] = useState<Mode>(() => {
    const q = (router.query.mode as string) || "login";
    return q === "register" ? "register" : "login";
  });

  // общие поля
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // админ
  const [adminLogin, setAdminLogin] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // код (для регистрации seller/installer)
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    const url = `/login${isLockedRole ? `?role=${role}` : `?role=${role}&mode=${mode}`}`;
    router.replace(url, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (role === "admin") {
        if (!adminLogin.trim() || !adminPassword.trim()) return alert("Введите логин и пароль");
        await loginAdmin({ login: adminLogin.trim(), password: adminPassword.trim() });
        return router.push("/admin");
      }

      if (mode === "register") {
        if (!firstName.trim() || !lastName.trim() || !phone.trim()) return alert("Введите имя/фамилию/телефон");
        if (!inviteCode.trim()) return alert("Введите код подтверждения");
        if (inviteCode.trim() !== INVITE_CODE_DEMO) return alert("Неверный код. Для демо — 0000");

        if (role === "seller") {
          await registerSeller({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), code: inviteCode.trim() });
          return router.push("/seller");
        } else {
          await registerInstaller({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), code: inviteCode.trim() });
          return router.push("/installer");
        }
      } else {
        if (!firstName.trim() || !lastName.trim() || !phone.trim()) return alert("Введите имя/фамилию/телефон");
        await loginUser({
          role,
          phone: phone.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        return router.push(role === "seller" ? "/seller" : "/installer");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка аутентификации";
      alert(msg);
    }
  }

  const roleTitle = role === "seller" ? "Продавец" : role === "installer" ? "Монтажник" : "Администратор";
  const codeLabel = role === "seller" ? "Код подтверждения дилера" : "Код подтверждения продавца";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/sonmar-logo.webp" alt="SONMAR" width={140} height={40} className="h-10 w-auto" />
          </Link>
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition">← На главную</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {roleTitle}: {role === "admin" ? "вход" : mode === "register" ? "регистрация" : "вход"}
            </h1>
          </div>

          {!isLockedRole && (
            <div className="flex justify-center gap-4 mb-6">
              {(["seller", "installer", "admin"] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    if (r === "admin") setMode("login");
                  }}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 ${
                    role === r ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                  } transition`}
                >
                  {r === "seller" && "Продавец"}
                  {r === "installer" && "Монтажник"}
                  {r === "admin" && "Администратор"}
                </button>
              ))}
            </div>
          )}

          {role !== "admin" && (
            <div className="flex justify-center gap-4 mb-6">
              {(["login", "register"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
                    mode === m ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {m === "login" ? "Вход" : "Регистрация"}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            {role !== "admin" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Иван"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Иванов"
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">{codeLabel}</label>
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

            {role === "admin" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
                  <input
                    value={adminLogin}
                    onChange={(e) => setAdminLogin(e.target.value)}
                    placeholder="admin@sonmar.com.ua"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
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

          {role !== "admin" && (
            <div className="mt-6 text-center text-sm text-gray-500">
              {mode === "login" ? (
                <button onClick={() => setMode("register")} className="text-blue-600 hover:underline">
                  Нет аккаунта? Зарегистрироваться
                </button>
              ) : (
                <button onClick={() => setMode("login")} className="text-blue-600 hover:underline">
                  Уже есть аккаунт? Войти
                </button>
              )}
            </div>
          )}

          {isLockedRole && (
            <p className="mt-4 text-center text-xs text-slate-500">
              Вы перешли как <b>{roleTitle.toLowerCase()}</b>. Смена роли недоступна на этой странице.
            </p>
          )}
        </div>
      </main>

      <footer className="text-center text-gray-400 text-sm pb-6">&copy; 2025 SONMAR. Все права защищены.</footer>
    </div>
  );
}
