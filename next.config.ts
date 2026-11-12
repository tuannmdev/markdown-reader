import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server be opened from this LAN address; without it the HMR websocket and dev chunks are
  // blocked, so the page never hydrates and stays on its server-rendered "loading" state.
  allowedDevOrigins: ["172.24.144.1"],
};

export default nextConfig;
