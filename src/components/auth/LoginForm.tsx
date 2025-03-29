"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthButton from "./AuthButton";
import AuthInput from "./AuthInput";
import AuthDivider from "./AuthDivider";
import AuthProviderButton from "./AuthProviderButton";

export default function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn("credentials", {
                username: formData.username,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid username or password");
            } else {
                router.push("/");
                router.refresh();
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleProviderSignIn = (provider: string) => {
        setIsLoading(true);
        signIn(provider, { callbackUrl: "/" });
    };

    return (
        <div className="bg-black/30 p-8 rounded-lg backdrop-blur-sm">
            <div className="flex justify-center mb-8">
                <Image src="/logo.png" alt="WaveJam Logo" width={120} height={120} priority />
            </div>
            <h1 className="text-2xl font-bold text-center text-white mb-8">Log in to WaveJam</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-500 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <AuthProviderButton 
                    provider="spotify"
                    icon="/spotify-icon.png" 
                    onClick={() => handleProviderSignIn("spotify")}
                    disabled={isLoading}
                >
                    Continue with Spotify
                </AuthProviderButton>
                
                <AuthProviderButton 
                    provider="google"
                    icon="/google-icon.png" 
                    onClick={() => handleProviderSignIn("google")}
                    disabled={isLoading}
                >
                    Continue with Google
                </AuthProviderButton>
                
                <AuthProviderButton 
                    provider="facebook"
                    icon="/facebook-icon.png" 
                    onClick={() => handleProviderSignIn("facebook")}
                    disabled={isLoading}
                >
                    Continue with Facebook
                </AuthProviderButton>
                
                <AuthProviderButton 
                    provider="github"
                    icon="/github-icon.png" 
                    onClick={() => handleProviderSignIn("github")}
                    disabled={isLoading}
                >
                    Continue with GitHub
                </AuthProviderButton>

                <AuthDivider text="or" />

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AuthInput
                        label="Email or username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                    />

                    <AuthInput
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                    />

                    <AuthButton type="submit" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Log In"}
                    </AuthButton>
                </form>

                <div className="text-center mt-6">
                    <p className="text-zinc-400 text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-white hover:underline">
                            Sign up for WaveJam
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}