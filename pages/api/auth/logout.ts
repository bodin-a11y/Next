import type { NextApiRequest, NextApiResponse } from "next";
import { clearSessionCookie, readSessionFromReq } from "../../../lib/auth";
import { deleteSession } from "../../../data/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sess = readSessionFromReq(req);
  clearSessionCookie(res);
  deleteSession(sess?.token);
  return res.status(200).json({ ok: true });
}
