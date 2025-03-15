import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactStrictMode: true,
	env: {
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
	}
};

export default nextConfig;
