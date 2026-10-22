import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	experimental: {
		optimizePackageImports: ["lucide-react", "motion"],
	},
};

export default nextConfig;
