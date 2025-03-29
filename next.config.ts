import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactStrictMode: true,
	trailingSlash: true,
	images: {
		remotePatterns: [
			{
				hostname: "i.scdn.co",
			},
			{
				hostname: "mosaic.scdn.co",
			},
			{
				hostname: "image-cdn-ak.spotifycdn.com",
			},
			{
				hostname: "image-cdn-fa.spotifycdn.com",
			}
		]
	},
	experimental: {
		serverActions: {
			allowedOrigins: [
				"http://localhost:3000",
				"http://vijaymeena.dev",
				"https://vijaymeena.dev",
				"http://wavejam.vijaymeena.dev",
				"https://wavejam.vijaymeena.dev"
			],
		},
		optimizeCss: true,
		optimizeServerReact: true
	}
};

export default nextConfig;
