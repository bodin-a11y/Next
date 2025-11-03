import { daysLeft } from "@/lib/date";
import { WarrantyStatusResponse } from "@/types/warranty";

type Props = { data: WarrantyStatusResponse | null; loading?: boolean };

export default function StatusCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-white shadow animate-pulse">
        <div className="h-6 w-40 bg-slate-200 rounded mb-3" />
        <div className="h-4 w-72 bg-slate-200 rounded" />
      </div>
    );
  }
  if (!data) return null;

  const { status, device, activationDate } = data;

  const badge = {
    ACTIVE: "bg-green-100 text-green-700",
    PENDING: "bg-amber-100 text-amber-700",
    DRAFT: "bg-slate-100 text-slate-700",
    RETURNED: "bg-rose-100 text-rose-700",
    NOT_FOUND: "bg-slate-100 text-slate-700",
  }[status];

  return (
    <div className="p-6 rounded-2xl bg-white shadow">
      <div className="flex items-center gap-3 mb-2">
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badge}`}>
          {label(status)}
        </span>
        {device?.serial && (
          <span className="text-sm text-slate-500">SN: {device.serial}</span>
        )}
      </div>

      {status === "PENDING" && (
        <p className="text-slate-700">
          Идёт 14-дневный период. Осталось <b>{daysLeft(activationDate)}</b> дн.
        </p>
      )}
      {status === "ACTIVE" && (
        <p className="text-slate-700">Гарантия активна. Можно скачать талон.</p>
      )}
      {status === "RETURNED" && (
        <p className="text-slate-700">Товар возвращён. Гарантия аннулирована.</p>
      )}
      {status === "DRAFT" && (
        <p className="text-slate-700">
          Черновик: ждём подтверждения/чека от продавца.
        </p>
      )}
      {status === "NOT_FOUND" && (
        <p className="text-slate-700">
          По этому серийному номеру гарантия не найдена — можно подать заявку.
        </p>
      )}
    </div>
  );
}

function label(s: string) {
  switch (s) {
    case "ACTIVE": return "Активен";
    case "PENDING": return "Ожидает активации";
    case "DRAFT": return "Черновик";
    case "RETURNED": return "Возврат";
    case "NOT_FOUND": return "Не найден";
    default: return s;
  }
}
