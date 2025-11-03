import type { NextApiRequest, NextApiResponse } from "next";
import type { RequestCodeBody } from "../../../types/auth";
import { saveOtp } from "../../../data/authStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { role, phone, dealerCode, managerCode } = req.body as RequestCodeBody;

  if (!role || !phone) return res.status(400).json({ error: "role и phone обязательны" });

  // TODO: здесь дергаешь n8n → PlanFix для валидации:
  // await fetch(process.env.N8N_REQUEST_CODE!, { method: "POST", body: JSON.stringify({role, phone, dealerCode, managerCode}) });

  // Мок: генерим 6-значный код и "шлём" (в реале — SMS/Telegram через n8n)
  const code = (Math.floor(100000 + Math.random()*900000)).toString();
  const expiresAt = Date.now() + 5*60*1000; // 5 минут

  saveOtp({ role, phone, code, expiresAt, meta: { dealerCode, managerCode } });

  // В дев-режиме удобно вернуть код, в прод — не возвращай
  const dev = process.env.NODE_ENV !== "production";
  return res.status(200).json({ ok: true, devCode: dev ? code : undefined });
}
