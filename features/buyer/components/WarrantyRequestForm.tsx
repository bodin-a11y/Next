import { useState } from "react";
import { WarrantyRequestPayload } from "@/types/warranty";

type Props = {
  serial: string;
  onSubmit: (payload: WarrantyRequestPayload) => Promise<void>;
  onCancel?: () => void;
};

export default function WarrantyRequestForm({ serial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<string>("");
  const [receiptBase64, setReceiptBase64] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function toBase64(file: File) {
    const buf = await file.arrayBuffer();
    // простое «сжатие» не делаем здесь — позже можно добавить canvas-compress
    return `data:${file.type};base64,${Buffer.from(buf).toString("base64")}`;
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const b64 = await toBase64(f);
    setReceiptBase64(b64);
  }

  async function submit() {
    if (!receiptBase64) return alert("Загрузите фото чека");
    setLoading(true);
    try {
      await onSubmit({
        serial,
        name,
        phone,
        email,
        purchaseDate: purchaseDate || undefined,
        receiptBase64,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow space-y-4">
      <h3 className="text-xl font-bold">Оформить заявку на гарантию</h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Серийный номер</label>
          <input className="w-full border rounded-lg px-3 py-2 bg-slate-50" value={serial} readOnly />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Дата покупки</label>
          <input type="date" className="w-full border rounded-lg px-3 py-2" value={purchaseDate}
                 onChange={(e) => setPurchaseDate(e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Имя</label>
          <input className="w-full border rounded-lg px-3 py-2" value={name}
                 onChange={(e) => setName(e.target.value)} placeholder="Иван" />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Телефон</label>
          <input className="w-full border rounded-lg px-3 py-2" value={phone}
                 onChange={(e) => setPhone(e.target.value)} placeholder="+380..." />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-1">Email (необязательно)</label>
        <input className="w-full border rounded-lg px-3 py-2" value={email}
               onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-1">Фото чека (обязательно)</label>
        <input type="file" accept="image/*" onChange={handleFile} />
      </div>

      <div className="flex gap-3">
        <button onClick={submit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                disabled={loading}>
          {loading ? "Отправка..." : "Отправить заявку"}
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
