import Link from "next/link";

type Props = {
  showInstruction?: boolean;
  showDownload?: boolean;
  warrantyPdf?: string;
  onCreateRequest?: () => void;
  onSupport?: () => void;
};

export default function Actions({
  showInstruction,
  showDownload,
  warrantyPdf,
  onCreateRequest,
  onSupport,
}: Props) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {showInstruction && (
        <Link
          href="/instruction"
          className="group block rounded-2xl bg-white border border-slate-200 p-5 hover:shadow-lg transition"
        >
          <h4 className="font-semibold mb-1">Инструкция</h4>
          <p className="text-slate-600 text-sm">Скачать руководство пользователя</p>
        </Link>
      )}

      {showDownload && warrantyPdf && (
        <a
          href={warrantyPdf}
          target="_blank"
          rel="noreferrer"
          className="group block rounded-2xl bg-white border border-slate-200 p-5 hover:shadow-lg transition"
        >
          <h4 className="font-semibold mb-1">Скачать талон (PDF)</h4>
          <p className="text-slate-600 text-sm">Откроется в новой вкладке</p>
        </a>
      )}

      {onCreateRequest && (
        <button
          onClick={onCreateRequest}
          className="rounded-2xl bg-blue-600 text-white p-5 font-semibold hover:bg-blue-700 transition text-left"
        >
          Оформить заявку
          <p className="text-white/80 font-normal text-sm mt-1">
            Если гарантия не зарегистрирована
          </p>
        </button>
      )}

      {onSupport && (
        <button
          onClick={onSupport}
          className="rounded-2xl bg-white border border-slate-200 p-5 font-semibold hover:shadow-lg transition text-left"
        >
          Обращение в сервис
          <p className="text-slate-600 font-normal text-sm mt-1">
            Сообщить о проблеме / задать вопрос
          </p>
        </button>
      )}
    </div>
  );
}
