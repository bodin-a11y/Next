import type { NextConfig } from "next";
import { env } from "process";

// Проверяем, есть ли REPLIT_DOMAINS
const domains = env.REPLIT_DOMAINS
  ? env.REPLIT_DOMAINS.split(",")
  : ["localhost"]; // fallback на localhost

const nextConfig: NextConfig = {
  // добавляем допустимые источники для дев-сервера
  allowedDevOrigins: [domains[0]],
  reactStrictMode: true, // можно добавить, чтобы не ругался при дев-запуске
};

export default nextConfig;
