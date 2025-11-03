// components/AdminLayout.tsx
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";
import { seedAdminDataOnce } from "../../data/admin";

export default function AdminLayout({ children, title = "Админ-панель" }: { children: ReactNode; title?: string }) {
  const router = useRouter();

  useEffect(() => {
    seedAdminDataOnce(); // инициализируем демо-данные один раз
  }, []);

  const nav = [
    { href: "/admin/users", label: "Пользователи и роли" },
    { href: "/admin/audit", label: "Аудит событий" },
    { href: "/admin/returns", label: "Возвраты и статусы" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/sonmar-logo.webp" alt="SONMAR" width={130} height={40} className="h-10 w-auto" />
          </Link>
          <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
          <nav className="hidden md:flex gap-6 text-sm">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`hover:text-blue-600 ${router.pathname === n.href ? "text-blue-600 font-semibold" : "text-slate-600"}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>

      <footer className="text-center text-xs text-slate-400 py-6">&copy; 2025 SONMAR</footer>
    </div>
  );
}
