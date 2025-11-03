// data/admin.ts
// Временные данные и LocalStorage-хелперы для админ-модулей

export type UserRole = "seller" | "installer" | "admin";
export type SystemRole = "admin" | "manager" | "viewer"; // роли уровня системы (для доступа в админке)

export type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  roles: SystemRole[]; // роли в нашей системе админки
  actorRole?: UserRole; // бизнес-роль пользователя (продавец/монтажник/админ)
  active: boolean;
  createdAt: string; // ISO
};

export type AuditEvent = {
  id: string;
  type: "login" | "registration" | "warranty_update" | "return" | "permission_change";
  message: string;
  actor?: string; // userId
  createdAt: string; // ISO
  meta?: Record<string, any>;
};

export type ReturnStatus = "draft" | "pending" | "rejected" | "approved";
export type WarrantyStatus = "draft" | "awaiting_activation" | "active";

export type ReturnRequest = {
  id: string;
  warrantyId: string;
  buyerName: string;
  product: string;
  requestedAt: string; // ISO
  reason: string;
  status: ReturnStatus;
};

export type WarrantyCard = {
  id: string;
  serial: string;
  model: string;
  status: WarrantyStatus;
  saleDate: string; // ISO
  sellerName?: string;
  installerName?: string;
};

const LS_USERS = "admin_users";
const LS_AUDIT = "admin_audit";
const LS_RETURNS = "admin_returns";
const LS_WARRANTIES = "admin_warranties";

// ---------- seed ----------
export function seedAdminDataOnce() {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem(LS_USERS)) {
    const now = new Date().toISOString();
    const users: AdminUser[] = [
      {
        id: "u_admin",
        firstName: "Админ",
        lastName: "Сонмар",
        email: "admin@sonmar.com.ua",
        roles: ["admin"],
        actorRole: "admin",
        active: true,
        createdAt: now,
      },
      {
        id: "u_seller1",
        firstName: "Иван",
        lastName: "Иванов",
        phone: "+380931234567",
        roles: ["manager"],
        actorRole: "seller",
        active: true,
        createdAt: now,
      },
      {
        id: "u_inst1",
        firstName: "Пётр",
        lastName: "Петров",
        phone: "+380501112233",
        roles: ["viewer"],
        actorRole: "installer",
        active: true,
        createdAt: now,
      },
    ];
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  }

  if (!localStorage.getItem(LS_AUDIT)) {
    const now = new Date().toISOString();
    const events: AuditEvent[] = [
      {
        id: "a1",
        type: "registration",
        message: "Регистрация продавца Иван Иванов",
        actor: "u_seller1",
        createdAt: now,
      },
      {
        id: "a2",
        type: "login",
        message: "Вход администратора admin@sonmar.com.ua",
        actor: "u_admin",
        createdAt: now,
      },
      {
        id: "a3",
        type: "warranty_update",
        message: "Обновлён статус гарантийного талона WRT-001 → awaiting_activation",
        createdAt: now,
        meta: { warrantyId: "WRT-001", status: "awaiting_activation" },
      },
    ];
    localStorage.setItem(LS_AUDIT, JSON.stringify(events));
  }

  if (!localStorage.getItem(LS_WARRANTIES)) {
    const now = new Date().toISOString();
    const warranties: WarrantyCard[] = [
      {
        id: "WRT-001",
        serial: "SN-SON-001",
        model: "PUMP-MINI",
        status: "awaiting_activation",
        saleDate: now,
        sellerName: "Иван Иванов",
      },
      {
        id: "WRT-002",
        serial: "SN-SON-002",
        model: "PUMP-MAX",
        status: "active",
        saleDate: now,
        sellerName: "Иван Иванов",
        installerName: "Пётр Петров",
      },
    ];
    localStorage.setItem(LS_WARRANTIES, JSON.stringify(warranties));
  }

  if (!localStorage.getItem(LS_RETURNS)) {
    const now = new Date().toISOString();
    const returns: ReturnRequest[] = [
      {
        id: "R-1001",
        warrantyId: "WRT-001",
        buyerName: "Андрей Коваленко",
        product: "PUMP-MINI",
        requestedAt: now,
        reason: "Не подошла по характеристикам",
        status: "pending",
      },
      {
        id: "R-1002",
        warrantyId: "WRT-002",
        buyerName: "Олег Савчук",
        product: "PUMP-MAX",
        requestedAt: now,
        reason: "Дефект",
        status: "draft",
      },
    ];
    localStorage.setItem(LS_RETURNS, JSON.stringify(returns));
  }
}

// ---------- users ----------
export function getUsers(): AdminUser[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LS_USERS);
  return raw ? JSON.parse(raw) : [];
}

export function saveUsers(users: AdminUser[]) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}

export function upsertUser(u: AdminUser) {
  const list = getUsers();
  const i = list.findIndex((x) => x.id === u.id);
  if (i >= 0) list[i] = u; else list.push(u);
  saveUsers(list);
}

export function toggleUserActive(id: string, active: boolean) {
  const list = getUsers().map((u) => (u.id === id ? { ...u, active } : u));
  saveUsers(list);
}

// ---------- audit ----------
export function getAudit(): AuditEvent[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LS_AUDIT);
  return raw ? JSON.parse(raw) : [];
}

export function addAudit(e: AuditEvent) {
  const list = getAudit();
  list.unshift(e);
  localStorage.setItem(LS_AUDIT, JSON.stringify(list));
}

// ---------- returns ----------
export function getReturns(): ReturnRequest[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LS_RETURNS);
  return raw ? JSON.parse(raw) : [];
}

export function saveReturns(list: ReturnRequest[]) {
  localStorage.setItem(LS_RETURNS, JSON.stringify(list));
}

export function updateReturnStatus(id: string, status: ReturnStatus) {
  const list = getReturns().map((r) => (r.id === id ? { ...r, status } : r));
  saveReturns(list);
  addAudit({
    id: `audit-${Date.now()}`,
    type: "return",
    message: `Обновлён статус возврата ${id} → ${status}`,
    createdAt: new Date().toISOString(),
  });
}

// ---------- warranties ----------
export function getWarranties(): WarrantyCard[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LS_WARRANTIES);
  return raw ? JSON.parse(raw) : [];
}

export function setWarrantyStatus(id: string, status: WarrantyStatus) {
  const list = getWarranties().map((w) => (w.id === id ? { ...w, status } : w));
  localStorage.setItem(LS_WARRANTIES, JSON.stringify(list));
  addAudit({
    id: `audit-${Date.now()}`,
    type: "warranty_update",
    message: `Гарантийный талон ${id} → ${status}`,
    createdAt: new Date().toISOString(),
    meta: { warrantyId: id, status },
  });
}
