// next.config.ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: {
    // Non fermare la build se ci sono errori ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Non fermare la build se ci sono errori TypeScript
    ignoreBuildErrors: true,
  },
}

export default nextConfig
