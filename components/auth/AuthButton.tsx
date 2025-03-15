"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

const AuthButton: React.FC<AuthButtonProps> = ({
  children,
  className,
  variant = "primary",
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        "w-full py-3 px-4 rounded-full font-medium text-sm transition-colors focus:outline-none",
        variant === "primary"
          ? "bg-green-500 hover:bg-green-600 text-black"
          : "bg-transparent border border-gray-600 hover:border-white text-white",
        disabled && "opacity-50 cursor-not-allowed hover:bg-green-500",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default AuthButton