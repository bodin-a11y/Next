// mock-server.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import type { Request, Response, NextFunction } from "express";

/**
 * Конфиг
 */
const PORT = Number(process.env.MOCK_PORT || 4001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || true; // true = отражать Origin, можно указать строку

/**
 * Инициализация
 */
const app = express();
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(cookieParser());

/**
 * Типы «базы»
 */
type Role = "admin" | "seller" | "installer";
type Status = "NOT_FOUND" | "DRAFT" | "PENDING" | "ACTIVE";

type BuyerInfo = {
  fullName?: string;
  phone?: string;
  address?: string;
};

type SellerInfo = {
  phone?: string; // телефон продавца (кто создал)
  customerName?: string;
  customerPhone?: string;
  purchaseDate?: string; // YYYY-MM-DD
  receiptBase64?: string; // чек
};

type InstallerInfo = {
  phone?: string; // идентификатор монтажника (в демо: profile.phone)
  note?: string;
  photos?: string[]; // base64
};

type Warranty = {
  serial: string;
  status: Status;
  createdAt: number; // ms
  activationDate?: number; // ms
  warrantyPdf?: string | null;

  buyer?: BuyerInfo;
  seller?: SellerInfo;
  installer?: InstallerInfo;
};

type Session =
  | { role: "admin"; login?: string }
  | { role: "seller" | "installer"; phone?: string; firstName?: string; lastName?: string };

/**
 * In-memory хранилища
 */
const warranties = new Map<string, Warranty>();
const sessions = new Map<string, Session>();

/**
 * Утилиты
 */
const now = () => Date.now();
const inDays = (d: number) => d * 24 * 60 * 60 * 1000;

function computeStatus(w: Warranty | undefined): Status {
  if (!w) return "NOT_FOUND";
  if (w.status === "PENDING" && w.activationDate && now() >= w.activationDate) {
    return "ACTIVE";
  }
  return w.status;
}

function makeToken() {
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2)
  );
}

/**
 * Мидлвары
 */
function auth(req: Request, res: Response, next: NextFunction) {
  const bearer =
    req.headers.authorization?.replace(/^Bearer\s+/i, "") ||
    (req.cookies && (req.cookies["token"] as string | undefined));

  if (!bearer) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const s = sessions.get(bearer);
  if (!s) {
    return res.status(401).json({ error: "invalid token" });
  }
  (req as any).session = s;
  (req as any).token = bearer;
  next();
}

/**
 * Health / Ping
 */
app.get("/health", (_req, res) => res.json({ ok: true, ts: now() }));
app.get("/", (_req, res) => res.json({ ok: true, service: "mock-api", ts: now() }));

/**
 * ============================
 *            AUTH
 * ============================
 */

/**
 * POST /auth/login
 * admin:   { role:"admin", login, password }
 * seller:  { role:"seller", phone, firstName, lastName }
 * installer:{ role:"installer", phone, firstName, lastName }
 */
app.post("/auth/login", (req: Request, res: Response) => {
  const { role, login, password, phone, firstName, lastName } = req.body || {};
  if (!role) return res.status(400).json({ error: "role is required" });

  if (role === "admin") {
    if (!login || !password) {
      return res.status(400).json({ error: "login & password required" });
    }
    // Демо: любой логин/пароль валидны
    const token = makeToken();
    const sess: Session = { role: "admin", login };
    sessions.set(token, sess);
    res.cookie("token", token, { httpOnly: false, sameSite: "lax" });
    return res.json({ token, role: "admin", login });
  }

  if (!phone || !firstName || !lastName) {
    return res.status(400).json({ error: "phone, firstName, lastName required" });
  }
  const token = makeToken();
  const sess: Session = { role, phone, firstName, lastName } as Session;
  sessions.set(token, sess);
  res.cookie("token", token, { httpOnly: false, sameSite: "lax" });
  return res.json({ token, role, phone, firstName, lastName });
});

/**
 * GET /auth/me
 * Возвращает профиль из сессии по токену/куке
 */
app.get("/auth/me", auth, (req: Request, res: Response) => {
  return res.json((req as any).session as Session);
});

/**
 * POST /auth/logout
 * Удаляет сессию и чистит куку
 */
app.post("/auth/logout", auth, (req: Request, res: Response) => {
  const token = (req as any).token as string;
  sessions.delete(token);
  res.clearCookie("token");
  return res.json({ ok: true });
});

/**
 * POST /auth/planfix/register-seller
 * { firstName, lastName, phone, code } — в демо код принимаем любой
 */
app.post("/auth/planfix/register-seller", (req: Request, res: Response) => {
  const { firstName, lastName, phone, code } = req.body || {};
  if (!firstName || !lastName || !phone || !code) {
    return res.status(400).json({ error: "firstName, lastName, phone, code required" });
  }
  // Демоверсия: просто 200
  return res.json({ ok: true, role: "seller" });
});

/**
 * POST /auth/planfix/register-installer
 * { firstName, lastName, phone, code } — демо код тоже любой
 */
app.post("/auth/planfix/register-installer", (req: Request, res: Response) => {
  const { firstName, lastName, phone, code } = req.body || {};
  if (!firstName || !lastName || !phone || !code) {
    return res.status(400).json({ error: "firstName, lastName, phone, code required" });
  }
  return res.json({ ok: true, role: "installer" });
});

/**
 * ============================
 *          WARRANTY
 * ============================
 */

/**
 * GET /warranty/status?serial=SN123
 * Возвращает статус талона; переводит PENDING→ACTIVE, если activationDate в прошлом
 */
app.get("/warranty/status", (req: Request, res: Response) => {
  const serial = String(req.query.serial || "").trim();
  if (!serial) return res.status(400).json({ error: "serial required" });

  const existing = warranties.get(serial);
  if (!existing) {
    return res.json({ serial, status: "NOT_FOUND" as Status });
  }
  const st = computeStatus(existing);
  const updated: Warranty = { ...existing, status: st };
  warranties.set(serial, updated);

  return res.json({
    serial,
    status: updated.status,
    activationDate: updated.activationDate ?? null,
    warrantyPdf:
      updated.status === "ACTIVE"
        ? updated.warrantyPdf || `https://example.com/warranty-${serial}.pdf`
        : null,
  });
});

/**
 * POST /warranty/request
 * { serial, fullName?, phone?, address? }
 * Создаёт Черновик от покупателя / сохраняет buyer
 */
app.post("/warranty/request", (req: Request, res: Response) => {
  const { serial, fullName, phone, address } = req.body || {};
  if (!serial) return res.status(400).json({ error: "serial required" });

  const existed = warranties.get(serial);
  const base: Warranty =
    existed || {
      serial,
      status: "DRAFT",
      createdAt: now(),
    };
  base.status = "DRAFT";
  base.buyer = { fullName, phone, address };
  warranties.set(serial, base);

  return res.json({ ok: true, status: "DRAFT" as Status });
});

/**
 * POST /warranty/create
 * Продавец создал талон → сразу PENDING + activationDate = now + 14d
 * body: { serial, customerName?, customerPhone?, purchaseDate?, receiptBase64, sellerPhone? }
 */
app.post("/warranty/create", (req: Request, res: Response) => {
  const {
    serial,
    customerName,
    customerPhone,
    purchaseDate,
    receiptBase64,
    sellerPhone,
  } = req.body || {};
  if (!serial || !receiptBase64) {
    return res.status(400).json({ error: "serial and receiptBase64 required" });
  }

  const w: Warranty = warranties.get(serial) || {
    serial,
    status: "PENDING",
    createdAt: now(),
  };

  w.status = "PENDING";
  w.activationDate = now() + inDays(14); // для тестов можно уменьшить
  w.seller = {
    phone: sellerPhone,
    customerName,
    customerPhone,
    purchaseDate,
    receiptBase64,
  };

  warranties.set(serial, w);
  return res.json({ ok: true, status: "PENDING" as Status, activationDate: w.activationDate });
});

/**
 * ============================
 *        INSTALLER CONFIRM
 * ============================
 */

/**
 * POST /auth/planfix/confirm
 * Монтажник подтвердил монтаж
 * body: { serial, installerName, note?, photos: string[] (base64) }
 * Если статус был DRAFT/NOT_FOUND → переведём в PENDING + activationDate
 */
app.post("/auth/planfix/confirm", (req: Request, res: Response) => {
  const { serial, installerName, note, photos } = req.body || {};
  if (!serial || !Array.isArray(photos) || photos.length === 0) {
    return res.status(400).json({ error: "serial and photos[] required" });
  }

  const w: Warranty =
    warranties.get(serial) || ({
      serial,
      status: "DRAFT",
      createdAt: now(),
    } as Warranty);

  w.installer = { phone: installerName, note, photos };

  if (w.status === "DRAFT" || w.status === "NOT_FOUND") {
    w.status = "PENDING";
    w.activationDate = now() + inDays(14);
  }

  warranties.set(serial, w);
  return res.json({
    ok: true,
    status: computeStatus(w),
    activationDate: w.activationDate ?? null,
  });
});

/**
 * ============================
 *           SUPPORT
 * ============================
 */

/**
 * POST /warranty/support
 * Любая форма обращения: { serial?, status?, text?, contact? }
 * В демо просто отвечаем 200
 */
app.post("/warranty/support", (_req: Request, res: Response) => {
  return res.json({ ok: true });
});

/**
 * Запуск
 */
app.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}`);
});
