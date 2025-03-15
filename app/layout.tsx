import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Providers from "./providers";

export const metadata: Metadata = {
	title: "WaveJam",
	description:
		"Discover and stream your favorite music anytime, anywhere with WaveJam. Enjoy curated playlists, trending tracks, and personalized recommendations in a seamless, high-quality listening experience. Tune in now and elevate your music journey!",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<Providers>
				<body className={`max-w-screen-2xl h-dvh overflow-hidden mx-auto bg-black antialiased`}>
					<Navbar />
					{children}
				</body>
			</Providers>
		</html>
	);
}
