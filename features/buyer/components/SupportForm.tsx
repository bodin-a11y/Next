import { useState } from "react";
import { SupportPayload, WarrantyStatus } from "@/types/warranty";

type Props = {
  serial: string;
  status?: WarrantyStatus;
  onSubmit: (payload: SupportPayload) => Promise<void>;
  onCancel?: () => void;
};

export default function SupportForm({ serial, status, onSubmit, onCancel }: Props) {
  const [name, setName] = useState("");
  const [contacts, setContacts] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ serial, name, contacts, message, status });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow space-y-4">
      <h3 className="text-xl font-bold">Обращение в сервис</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Серийный номер</label>
          <input className="w-full border rounded-lg px-3 py-2 bg-slate-50" value={serial} readOnly />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Статус талона</label>
          <input className="w-full border rounded-lg px-3 py-2 bg-slate-50" value={status || "—"} readOnly />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Имя</label>
          <input className="w-full border rounded-lg px-3 py-2" value={name} onChange={(e)=>setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Контакты</label>
          <input className="w-full border rounded-lg px-3 py-2" value={contacts} onChange={(e)=>setContacts(e.target.value)} placeholder="+380..., @telegram" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-1">Сообщение</label>
        <textarea className="w-full border rounded-lg px-3 py-2 min-h-[120px]" value={message} onChange={(e)=>setMessage(e.target.value)} />
      </div>

      <div className="flex gap-3">
        <button onClick={submit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                disabled={loading}>
          {loading ? "Отправка..." : "Отправить"}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-white border hover:bg-slate-50">
            Отмена
          </button>
        )}
      </div>
    </div>
  );
}
