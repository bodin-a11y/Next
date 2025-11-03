import type { NextApiRequest, NextApiResponse } from "next";
import type { WarrantyStatusResponse } from "../../../types/warranty";
import { getRecord, updateRecord } from "../../../data/store";

function toResponseFromStore(rec: any): WarrantyStatusResponse {
  return {
    status: rec.status,
    device: { model: rec.model || "PumpA1", serial: rec.serial, purchaseDate: rec.purchaseDate },
    seller: rec.seller,
    warrantyPdf: rec.warrantyPdf,
    activationDate: rec.activationDate,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<WarrantyStatusResponse>) {
  const serial = (req.query.serial as string) || "";

  if (!serial) return res.status(200).json({ status: "NOT_FOUND" });

  // 1) Пытаемся найти в локальном хранилище
  const rec = getRecord(serial);
  if (rec) {
    // авто-переход в ACTIVE, если прошло 14 дней
    if (rec.status !== "ACTIVE" && rec.activationDate) {
      const now = Date.now();
      const act = Date.parse(rec.activationDate);
      if (!Number.isNaN(act) && now >= act) {
        const next = updateRecord(serial, { status: "ACTIVE" });
        return res.status(200).json(toResponseFromStore(next!));
      }
    }
    return res.status(200).json(toResponseFromStore(rec));
  }

  // 2) Fallback: твоя прежняя "демо" логика по последней цифре SN
  if (serial.endsWith("0")) {
    return res.status(200).json({
      status: "ACTIVE",
      device: { model: "PumpA1", serial, purchaseDate: "2025-10-20" },
      seller: { name: "ООО Водомир", phone: "+38 0xx xxx xx xx" },
      warrantyPdf: "/dummy/SONMAR-warranty.pdf",
    });
  }
  if (serial.endsWith("1")) {
    const act = new Date(Date.now() + 9 * 24 * 3600 * 1000).toISOString();
    return res.status(200).json({
      status: "PENDING",
      device: { model: "PumpA1", serial, purchaseDate: "2025-11-01" },
      activationDate: act,
    });
  }
  if (serial.endsWith("2")) {
    return res.status(200).json({ status: "RETURNED", device: { model: "PumpA1", serial } });
  }
  if (serial.endsWith("3")) {
    return res.status(200).json({ status: "DRAFT", device: { model: "PumpA1", serial } });
  }
  return res.status(200).json({ status: "NOT_FOUND" });
}
