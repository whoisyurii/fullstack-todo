import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use static export only for production builds
  ...(process.env.NODE_ENV === "production" && {
    output: "export",
  }),
};

export default nextConfig;
