"use client";
import { useSession } from "next-auth/react";
import dynamic from 'next/dynamic';

// Dynamically import the SpotifyWebPlayer to ensure it only loads client-side
const SpotifyWebPlayer = dynamic(
  () => import('@/src/components/SpotifyWebPlayer'),
  { ssr: false }
);

export default function PlayerWrapper() {
  const { data: session } = useSession();
  
  // Only render the player if we have a session
  if (!session) return null;
  
  return <SpotifyWebPlayer />;
}