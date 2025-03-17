"use client";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { PlayerProvider } from "@/lib/PlayerContext";

export default function Providers({ children, session }: { children: React.ReactNode, session: Session|null }) {
	return (
		<SessionProvider session={session}>
			<PlayerProvider>
				{children}
			</PlayerProvider>
		</SessionProvider>
	);
}
