// pages/admin/users.tsx
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../features/admin/AdminLayout";
import {
  AdminUser,
  SystemRole,
  UserRole,
  getUsers,
  upsertUser,
  toggleUserActive,
  addAudit,
} from "../../data/admin";

const SYSTEM_ROLES: SystemRole[] = ["admin", "manager", "viewer"];
const ACTOR_ROLES: UserRole[] = ["seller", "installer", "admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) =>
      [u.firstName, u.lastName, u.email, u.phone].filter(Boolean).some((v) => v!.toLowerCase().includes(s))
    );
  }, [users, q]);

  function handleRoleToggle(u: AdminUser, role: SystemRole) {
    const roles = u.roles.includes(role) ? u.roles.filter((r) => r !== role) : [...u.roles, role];
    const updated: AdminUser = { ...u, roles };
    upsertUser(updated);
    setUsers(getUsers());
    addAudit({
      id: `audit-${Date.now()}`,
      type: "permission_change",
      message: `Права пользователя ${u.firstName} ${u.lastName} → [${roles.join(", ")}]`,
      actor: "u_admin",
      createdAt: new Date().toISOString(),
      meta: { userId: u.id, roles },
    });
  }

  function handleActiveToggle(u: AdminUser) {
    toggleUserActive(u.id, !u.active);
    setUsers(getUsers());
  }

  function handleActorRoleChange(u: AdminUser, actorRole: UserRole) {
    const updated: AdminUser = { ...u, actorRole };
    upsertUser(updated);
    setUsers(getUsers());
  }

  function handleEdit(u?: AdminUser) {
    const firstName = prompt("Имя:", u?.firstName || "")?.trim();
    if (!firstName) return;
    const lastName = prompt("Фамилия:", u?.lastName || "")?.trim();
    if (!lastName) return;
    const email = prompt("Email (необязательно):", u?.email || "")?.trim() || undefined;
    const phone = prompt("Телефон (необязательно):", u?.phone || "")?.trim() || undefined;

    const base: AdminUser = u || {
      id: `u_${Date.now()}`,
      firstName: "",
      lastName: "",
      roles: ["viewer"],
      actorRole: "seller",
      active: true,
      createdAt: new Date().toISOString(),
    };
    const updated: AdminUser = { ...base, firstName, lastName, email, phone };
    upsertUser(updated);
    setUsers(getUsers());
  }

  return (
    <AdminLayout title="Админ-панель — Пользователи и роли">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по имени, email, телефону"
            className="border rounded-lg px-3 py-2 w-64 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button
          onClick={() => handleEdit(undefined)}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          + Новый пользователь
        </button>
      </div>

      <div className="overflow-auto bg-white rounded-xl shadow">
        <table className="min-w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Пользователь</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Контакты</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Бизнес-роль</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Системные роли</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Статус</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">
                    {u.firstName} {u.lastName}
                  </div>
                  <div className="text-xs text-slate-500">ID: {u.id}</div>
                  <div className="text-xs text-slate-400">Создан: {new Date(u.createdAt).toLocaleString()}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="text-slate-700">{u.email || "—"}</div>
                  <div className="text-slate-500">{u.phone || "—"}</div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.actorRole || "seller"}
                    onChange={(e) => handleActorRoleChange(u, e.target.value as UserRole)}
                    className="border rounded px-2 py-1"
                  >
                    {ACTOR_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r === "seller" ? "Продавец" : r === "installer" ? "Монтажник" : "Админ"}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {SYSTEM_ROLES.map((r) => {
                      const active = u.roles.includes(r);
                      return (
                        <button
                          key={r}
                          onClick={() => handleRoleToggle(u, r)}
                          className={`px-2 py-1 rounded text-xs border ${
                            active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600"
                          }`}
                          title="Переключить роль"
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      u.active ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {u.active ? "Активен" : "Выключен"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(u)}
                      className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleActiveToggle(u)}
                      className={`px-3 py-1.5 rounded text-sm ${
                        u.active ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      {u.active ? "Отключить" : "Включить"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  Ничего не найдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
