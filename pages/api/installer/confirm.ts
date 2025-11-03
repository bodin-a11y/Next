import type { NextApiRequest, NextApiResponse } from "next";
import { getRecord, upsertRecord } from "../../../data/store";
import type { WarrantyRecord, InstallationInfo } from "../../../types/warranty";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { serial, installerName, installerPhone, photos } = req.body || {};
  if (!serial) return res.status(400).json({ error: "serial обязателен" });

  const exist = getRecord(serial);
  const nowISO = new Date().toISOString();

  if (!exist) {
    // если продавец ещё не создал талон — создадим черновик с инсталляцией
    const rec: WarrantyRecord = {
      serial,
      status: "DRAFT",
      model: "PumpA1",
      createdAt: nowISO,
      updatedAt: nowISO,
      installation: {
        installerName,
        installerPhone,
        photos: Array.isArray(photos) ? photos : undefined,
        confirmedAt: nowISO,
      },
    };
    upsertRecord(rec);
    return res.status(200).json({ ok: true, status: rec.status });
  }

  // обновим установку
  const installation: InstallationInfo = {
    installerName,
    installerPhone,
    photos: Array.isArray(photos) ? photos : exist.installation?.photos,
    confirmedAt: nowISO,
  };

  // если 14 дней уже прошли — делаем ACTIVE, иначе оставляем PENDING
  let nextStatus = exist.status;
  if (exist.activationDate && Date.now() >= Date.parse(exist.activationDate)) {
    nextStatus = "ACTIVE";
  }

  const updated: WarrantyRecord = {
    ...exist,
    status: nextStatus,
    installation,
    updatedAt: nowISO,
  };

  upsertRecord(updated);
  return res.status(200).json({ ok: true, status: updated.status });
}
