import type { AuthProfile } from "../types/auth";

type Session = { token: string; profile: AuthProfile; expiresAt: number };
const SESS_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 дней

const sessions = new Map<string, Session>(); // token -> session

export function newSession(profile: AuthProfile) {
  const token = cryptoRandom();
  const now = Date.now();
  const sess: Session = { token, profile, expiresAt: now + SESS_TTL_MS };
  sessions.set(token, sess);
  return sess;
}

export function getSession(token?: string | null) {
  if (!token) return null;
  const s = sessions.get(token);
  if (!s) return null;
  if (Date.now() > s.expiresAt) { sessions.delete(token); return null; }
  return s;
}

export function deleteSession(token?: string | null) {
  if (!token) return;
  sessions.delete(token);
}

function cryptoRandom() {
  return [...crypto.getRandomValues(new Uint8Array(16))]
    .map(b => b.toString(16).padStart(2,"0")).join("");
}
