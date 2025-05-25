"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AuthProviderButton from "./AuthProviderButton";

export default function LoginForm() {
    const router = useRouter();
    const { status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if already authenticated
    if (status === "authenticated") {
        router.push("/");
        return null;
    }

    const handleProviderSignIn = async (provider: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const result = await signIn(provider, {
                callbackUrl: "/",
                redirect: false
            });

            if (result?.error) {
                setError("Failed to sign in. Please try again.");
            } else if (result?.url) {
                router.push(result.url);
            }
        } catch (err) {
            console.error("Sign in error:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-black/30 p-8 rounded-lg backdrop-blur-sm border border-gray-800">
            <div className="flex justify-center mb-8">
                <Image src="/logo.png" alt="WaveJam Logo" width={120} height={120} priority />
            </div>

            <h1 className="text-2xl font-bold text-center text-white mb-2">Log in to WaveJam</h1>
            <p className="text-gray-400 text-center mb-8">Connect with your music streaming service</p>

            {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <AuthProviderButton
                    provider="spotify"
                    icon="/spotify-icon.png"
                    onClick={() => handleProviderSignIn("spotify")}
                    disabled={isLoading}
                >
                    {isLoading ? "Connecting..." : "Continue with Spotify"}
                </AuthProviderButton>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-black/30 text-gray-400">More options coming soon</span>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <p className="text-zinc-400 text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-white hover:underline">
                            Sign up for WaveJam
                        </Link>
                    </p>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-xs text-gray-500">
                    By continuing, you agree to WaveJam&apos;s Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}