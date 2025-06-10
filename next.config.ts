import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    domains: ["i.scdn.co", "your-other-image-source.com"], // Add the host(s) of your external URLs
  },
}

export default nextConfig
