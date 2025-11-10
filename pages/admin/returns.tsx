// pages/admin/returns.tsx
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../features/admin/AdminLayout";
import {
  ReturnRequest,
  WarrantyCard,
  WarrantyStatus,
  ReturnStatus,
  getReturns,
  getWarranties,
  updateReturnStatus,
  setWarrantyStatus,
} from "../../data/admin";

const RETURN_STATUSES: ReturnStatus[] = ["draft", "pending", "rejected", "approved"];
const WARRANTY_STATUSES: WarrantyStatus[] = ["draft", "awaiting_activation", "active"];

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [warranties, setWarranties] = useState<WarrantyCard[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    setReturns(getReturns());
    setWarranties(getWarranties());
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return returns;
    return returns.filter((r) =>
      [r.id, r.warrantyId, r.buyerName, r.product, r.reason].some((v) =>
        (v || "").toLowerCase().includes(s)
      )
    );
  }, [returns, q]);

  function warrantyById(id: string) {
    return warranties.find((w) => w.id === id);
  }

  function handleReturnStatus(id: string, status: ReturnStatus) {
    updateReturnStatus(id, status);
    setReturns(getReturns());
  }

  function handleWarrantyStatus(id: string, status: WarrantyStatus) {
    setWarrantyStatus(id, status);
    setWarranties(getWarranties());
  }

  return (
    <AdminLayout title="Админ-панель — Возвраты и статусы">
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по возвратам (ID, гарантия, покупатель, товар, причина)"
            className="border rounded-lg px-3 py-2 w-96"
          />
          <div className="text-sm text-slate-500">
            Демостраница: управляет статусами **возврата** и **гарантийного талона**
          </div>
        </div>
      </div>

      <div className="overflow-auto bg-white rounded-xl shadow">
        <table className="min-w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Возврат</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Покупатель</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Гарантия</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Статусы</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const w = warrantyById(r.warrantyId);
              return (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{r.id}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(r.requestedAt).toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600">Причина: {r.reason}</div>
                    <div className="text-xs text-slate-600">Товар: {r.product}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="text-slate-800">{r.buyerName}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {w ? (
                      <>
                        <div className="font-medium text-slate-800">{w.id} — {w.model}</div>
                        <div className="text-xs text-slate-500">Серийный: {w.serial}</div>
                        <div className="text-xs text-slate-500">
                          Продажа: {new Date(w.saleDate).toLocaleDateString()}
                        </div>
                      </>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="mb-2">
                      <div className="text-xs text-slate-500 mb-1">Статус возврата</div>
                      <select
                        value={r.status}
                        onChange={(e) => handleReturnStatus(r.id, e.target.value as ReturnStatus)}
                        className="border rounded px-2 py-1 w-56"
                      >
                        {RETURN_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 mb-1">Статус гарантийного талона</div>
                      <select
                        value={w?.status || "draft"}
                        onChange={(e) => w && handleWarrantyStatus(w.id, e.target.value as WarrantyStatus)}
                        className="border rounded px-2 py-1 w-56"
                        disabled={!w}
                      >
                        {WARRANTY_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded border ${
                        r.status === "approved"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : r.status === "rejected"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : r.status === "pending"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Записей не найдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
