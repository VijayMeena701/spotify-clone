import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sign Up | WaveJam",
  description: "Create a new WaveJam account to access your music"
};

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="w-full max-w-md bg-black/30 p-8 rounded-lg backdrop-blur-sm">
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="WaveJam Logo" width={120} height={120} priority />
        </div>
        <h1 className="text-2xl font-bold text-center text-white mb-8">Sign up for WaveJam</h1>
        
        <div className="space-y-4 text-center">
          <p className="text-white">
            Join WaveJam to discover and share your favorite music.
          </p>
          <p className="text-zinc-400 text-sm mt-4">
            To start your journey with WaveJam, please{" "}
            <Link href="/login" className="text-green-500 hover:underline">
              log in
            </Link>{" "}
            and connect with your preferred service.
          </p>
        </div>
      </div>
    </div>
  );
}