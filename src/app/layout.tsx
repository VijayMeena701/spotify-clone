import { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import FooterPlayer from "@/src/components/footerPlayer";
import PlayerWrapper from "@/src/components/PlayerWrapper";

export const metadata: Metadata = {
  title: "Wave-Jam",
  description: "A music app built with Next.js and Spotify SDK",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <html lang="en">
      <head></head>
      <body className="max-w-screen-2xl mx-auto bg-black antialiased text-white">
        <Providers>
          <main className="flex-1 pb-24 h-full relative">
            {children}
            <FooterPlayer />
            <PlayerWrapper />
          </main>
        </Providers>
      </body>
    </html>
  );
}
