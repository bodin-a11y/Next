// pages/admin/audit.tsx
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { AuditEvent, getAudit } from "../../data/admin";

const TYPES: AuditEvent["type"][] = ["login", "registration", "warranty_update", "return", "permission_change"];

export default function AdminAuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [type, setType] = useState<string>("all");
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  useEffect(() => {
    setEvents(getAudit());
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return events.filter((e) => {
      if (type !== "all" && e.type !== type) return false;
      if (s && !`${e.message} ${e.id}`.toLowerCase().includes(s)) return false;

      const t = new Date(e.createdAt).getTime();
      if (dateFrom) {
        const from = new Date(dateFrom).getTime();
        if (t < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1; // до конца дня
        if (t > to) return false;
      }
      return true;
    });
  }, [events, type, q, dateFrom, dateTo]);

  return (
    <AdminLayout title="Админ-панель — Аудит событий">
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Тип события</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">Все</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Поиск</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Текст сообщения, ID…"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">С даты</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">По дату</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="min-w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Событие</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Тип</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Дата</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Детали</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">{e.message}</div>
                  <div className="text-xs text-slate-500">ID: {e.id}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 text-xs rounded bg-slate-100 text-slate-700">{e.type}</span>
                </td>
                <td className="px-4 py-3 text-sm">{new Date(e.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {e.meta ? <pre className="bg-slate-50 p-2 rounded border overflow-auto">{JSON.stringify(e.meta, null, 2)}</pre> : "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  Нет событий по заданным фильтрам
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
