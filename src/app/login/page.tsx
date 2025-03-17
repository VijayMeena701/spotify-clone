import { Metadata } from "next";
import LoginForm from "@/src/components/auth/LoginForm";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login - WaveJam",
  description: "Login to your WaveJam account",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-4 bg-gradient-to-b from-neutral-900 to-black text-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="WaveJam Logo"
              width={120}
              height={120}
              className="mx-auto"
              priority
            />
          </Link>
          <h2 className="mt-6 text-3xl font-bold">Login to WaveJam</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Continue your musical journey
          </p>
        </div>
        
        <LoginForm />

        <div className="text-center mt-4">
          <p className="text-neutral-400 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-green-500 hover:text-green-400 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}