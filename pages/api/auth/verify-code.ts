import type { NextApiRequest, NextApiResponse } from "next";
import type { VerifyCodeBody, AuthProfile } from "../../../types/auth";
import { readOtp, deleteOtp } from "../../../data/authStore";
import { newSession } from "../../../data/session";
import { setSessionCookie } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { role, phone, code } = req.body as VerifyCodeBody;
  if (!role || !phone || !code) return res.status(400).json({ error: "role, phone, code обязательны" });

  const otp = readOtp(phone, role);
  if (!otp || otp.code !== code || Date.now() > otp.expiresAt) {
    return res.status(400).json({ error: "Неверный или просроченный код" });
  }

  // (опционально) спросить PlanFix/n8n о профиле пользователя
  const profile: AuthProfile = {
    role,
    phone,
    userId: "pf_" + phone, // из PlanFix позже
    dealerCode: otp.meta?.dealerCode,
    managerCode: otp.meta?.managerCode,
    createdAt: new Date().toISOString(),
  };

  // создаём сессию
  const sess = newSession(profile);
  setSessionCookie(res, sess.token);

  deleteOtp(phone, role);

  return res.status(200).json({ ok: true, profile });
}
