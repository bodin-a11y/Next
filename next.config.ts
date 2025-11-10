import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // можно добавить другие корректные поля, например:
  // swcMinify: true,
  // images: { domains: ["example.com"] },
  // eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
