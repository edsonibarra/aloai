import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { dev }) {
    if (dev) {
      // SQLite writes to prisma/dev.db would otherwise trigger a rebuild + page refresh on every DB write.
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ["**/node_modules/**", "**/.git/**", "**/.next/**", "**/prisma/*.db", "**/prisma/*.db-journal"],
      };
    }
    return config;
  },
};

export default nextConfig;
