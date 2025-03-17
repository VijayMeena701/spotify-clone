import { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import {auth} from "@/auth";

export const metadata: Metadata = {
  title: "Spotify Clone",
  description: "A Spotify clone built with Next.js",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  return (
    <html lang="en">
      <head></head>
      <body className="max-w-screen-2xl h-dvh overflow-hidden mx-auto bg-black antialiased text-white">
        <Providers session={session}>
          <main className="flex-1 overflow-y-auto pb-24">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
