import type { NextApiRequest } from "next";
import { serialize, parse } from "cookie";
import { getSession } from "../data/session";

export const SESSION_COOKIE = "sid";

export function setSessionCookie(res: any, token: string) {
  res.setHeader("Set-Cookie", serialize(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60*60*24*7, // 7 дней
  }));
}

export function clearSessionCookie(res: any) {
  res.setHeader("Set-Cookie", serialize(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  }));
}

export function readSessionFromReq(req: NextApiRequest) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies[SESSION_COOKIE];
  const sess = getSession(token);
  return sess;
}
