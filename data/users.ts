// data/users.ts

export type Role = "seller" | "installer" | "admin";

export type User = {
  role: Role;
  firstName?: string;
  lastName?: string;
  phone?: string;   // для seller/installer
  login?: string;   // для admin
  password?: string;// для admin
};

// ---- ТЕСТОВЫЕ ДАННЫЕ (для быстрого старта) ----
export const initialUsers: User[] = [
  // Можно сразу иметь по одному пользователю каждой роли (опционально)
  { role: "seller",    firstName: "Иван",  lastName: "Иванов",  phone: "+380931234567" },
  { role: "installer", firstName: "Петр",  lastName: "Петров",  phone: "+380501112233" },
  { role: "admin",     login: "admin@sonmar.com.ua", password: "1234" },
];

// ---- КЛЮЧИ ХРАНЕНИЯ ----
const LS_USERS_KEY = "users";
const LS_USER_KEY  = "user";

// ---- УТИЛИТЫ ДЛЯ LOCALSTORAGE ----
export function loadUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
}

export function setCurrentUser(user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LS_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearCurrentUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_USER_KEY);
}

// ---- ИНИЦИАЛИЗАЦИЯ (один раз) ----
export function seedUsersOnce() {
  if (typeof window === "undefined") return;
  const existing = loadUsers();
  if (!existing || existing.length === 0) {
    saveUsers(initialUsers);
  }
}

// ---- CRUD-ХЕЛПЕРЫ ----
export function upsertUser(user: User) {
  const users = loadUsers();
  const idx = users.findIndex(u =>
    user.role === "admin"
      ? u.role === "admin" && u.login === user.login
      : u.role === user.role && u.phone === user.phone
  );
  if (idx >= 0) users[idx] = { ...users[idx], ...user };
  else users.push(user);
  saveUsers(users);
}

export function findUserByRoleAndKey(role: Role, key: string): User | undefined {
  const users = loadUsers();
  if (role === "admin") {
    return users.find(u => u.role === "admin" && u.login === key);
  }
  return users.find(u => u.role === role && u.phone === key);
}
