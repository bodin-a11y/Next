import type { NextApiRequest, NextApiResponse } from "next";
import { readSessionFromReq } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sess = readSessionFromReq(req);
  if (!sess) return res.status(200).json({ ok: false, profile: null });
  return res.status(200).json({ ok: true, profile: sess.profile });
}
