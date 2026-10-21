import type { NextConfig } from "next";

// `output: "export"` produces a static bundle in `out/`.
// - Plugin mode (default): basePath `/plugins/openclawos` for gateway serving.
// - Desktop (DESKTOP=1): no basePath — Electron loads `out/index.html` via file://.
// - Dev (NEXT_OUTPUT=server): classic Next server, no export.
const isStaticExport = process.env["NEXT_OUTPUT"] !== "server";
const isDesktop = process.env["DESKTOP"] === "1";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export" as const,
        ...(isDesktop
          ? {}
          : { basePath: "/plugins/openclawos", assetPrefix: "/plugins/openclawos" }),
      }
    : {}),
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
