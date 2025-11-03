import type { WarrantyRecord } from "../types/warranty";

// in-memory на время жизни ноды (в dev может сбрасываться при HMR)
const store = new Map<string, WarrantyRecord>();

export function upsertRecord(rec: WarrantyRecord) {
  store.set(rec.serial, rec);
  return rec;
}

export function getRecord(serial: string) {
  return store.get(serial);
}

export function updateRecord(serial: string, patch: Partial<WarrantyRecord>) {
  const exist = store.get(serial);
  if (!exist) return undefined;
  const next = { ...exist, ...patch, updatedAt: new Date().toISOString() };
  store.set(serial, next);
  return next;
}
