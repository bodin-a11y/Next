import type { NextApiRequest, NextApiResponse } from "next";
import { upsertRecord, getRecord } from "../../../data/store";
import type { WarrantyRecord } from "../../../types/warranty";

function plusDaysISO(fromISO: string | undefined, days: number) {
  const base = fromISO ? new Date(fromISO) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { serial, purchaseDate, customerName, customerPhone, receiptBase64 } = req.body || {};
  if (!serial || !receiptBase64) {
    return res.status(400).json({ error: "serial и receiptBase64 обязательны" });
  }

  const nowISO = new Date().toISOString();
  const existing = getRecord(serial);

  const record: WarrantyRecord = {
    serial,
    status: "PENDING",                // продавец дал чек → талон ожидает 14 дней
    model: "PumpA1",
    purchaseDate: purchaseDate || nowISO.slice(0,10),
    receiptBase64,
    activationDate: plusDaysISO(purchaseDate, 14),
    warrantyPdf: undefined,
    seller: { name: customerName, phone: customerPhone },
    installation: existing?.installation,
    createdAt: existing?.createdAt || nowISO,
    updatedAt: nowISO,
  };

  upsertRecord(record);
  return res.status(200).json({ ok: true, status: record.status, activationDate: record.activationDate });
}
