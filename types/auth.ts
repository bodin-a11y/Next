export type UserRole = "seller" | "installer";

export interface AuthProfile {
  role: UserRole;
  phone: string;
  userId: string; // из PlanFix, когда подключишь
  dealerCode?: string;     // для продавца
  managerCode?: string;    // кто утвердил (менеджер/рук)
  createdAt: string;
}

export interface RequestCodeBody {
  role: UserRole;
  phone: string;
  dealerCode?: string;   // seller: код дилера
  managerCode?: string;  // installer: код от менеджера/продавца
}

export interface VerifyCodeBody {
  role: UserRole;
  phone: string;
  code: string;
}
