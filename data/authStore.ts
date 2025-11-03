type OtpEntry = { phone: string; role: "seller"|"installer"; code: string; expiresAt: number; meta?: Record<string, any> };
const otpMap = new Map<string, OtpEntry>(); // key: phone:role

export function saveOtp(entry: OtpEntry) {
  otpMap.set(`${entry.phone}:${entry.role}`, entry);
}
export function readOtp(phone: string, role: "seller"|"installer") {
  return otpMap.get(`${phone}:${role}`);
}
export function deleteOtp(phone: string, role: "seller"|"installer") {
  otpMap.delete(`${phone}:${role}`);
}
