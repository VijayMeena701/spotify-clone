"use client";

import { ButtonHTMLAttributes } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AuthProviderButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: string;
  icon: string;
  children: React.ReactNode;
}

export default function AuthProviderButton({
  provider,
  icon,
  children,
  className,
  disabled,
  ...props
}: AuthProviderButtonProps) {
  // Define provider-specific styling
  const getProviderStyles = (providerName: string) => {
    switch (providerName) {
      case "spotify":
        return "bg-[#1DB954] hover:bg-[#1ed760] text-black";
      case "google":
        return "bg-white hover:bg-gray-100 text-gray-800 border border-gray-300";
      case "facebook":
        return "bg-[#4267B2] hover:bg-[#3b5998] text-white";
      case "github":
        return "bg-[#24292e] hover:bg-[#2b3137] text-white border border-gray-700";
      default:
        return "bg-white hover:bg-gray-100 text-black";
    }
  };

  return (
    <button
      type="button"
      className={cn(
        "w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full font-medium text-sm transition-colors focus:outline-none",
        getProviderStyles(provider),
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled}
      {...props}
    >
      <div className="relative w-5 h-5">
        <Image
          src={icon}
          alt={`${provider} logo`}
          fill
          sizes="20px"
          className="object-contain"
        />
      </div>
      {children}
    </button>
  );
}