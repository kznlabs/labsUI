import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	...(process.env.STATIC_EXPORT && { output: "export" }),
	basePath,
	pageExtensions: ["tsx", "ts", ...(process.env.E2E ? ["e2e.tsx"] : [])],
	experimental: {
		optimizePackageImports: ["lucide-react", "motion"],
	},
};

export default nextConfig;
