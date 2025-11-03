export type WarrantyStatus = "ACTIVE" | "PENDING" | "DRAFT" | "RETURNED" | "NOT_FOUND";

export interface DeviceInfo {
  model: string;
  serial: string;
  purchaseDate?: string; // ISO
}

export interface SellerInfo {
  name?: string;
  phone?: string;
}

export interface WarrantyStatusResponse {
  status: WarrantyStatus;
  device?: DeviceInfo;
  seller?: SellerInfo;
  warrantyPdf?: string;
  activationDate?: string; // когда станет ACTIVE (после 14 дней)
}

export interface WarrantyRequestPayload {
  serial: string;
  name: string;
  phone?: string;
  email?: string;
  purchaseDate?: string; // ISO
  receiptBase64: string; // сжатая картинка
}

export interface SupportPayload {
  serial: string;
  name?: string;
  contacts?: string;
  message: string;
  attachments?: string[]; // base64
  status?: WarrantyStatus;
}

/** ===== Хранилище ===== */
export interface InstallationInfo {
  installerName?: string;
  installerPhone?: string;
  photos?: string[]; // base64 dataURLs
  confirmedAt?: string; // ISO
}

export interface WarrantyRecord {
  serial: string;
  status: WarrantyStatus; // DRAFT | PENDING | ACTIVE | RETURNED
  model?: string;
  purchaseDate?: string; // ISO
  receiptBase64?: string;
  activationDate?: string; // purchaseDate +14d
  warrantyPdf?: string; // сгенерим позже
  seller?: SellerInfo;
  installation?: InstallationInfo;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
