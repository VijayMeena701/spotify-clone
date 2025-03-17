"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function AuthInput({
  label,
  className,
  type = "text",
  disabled,
  ...props
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-200">{label}</label>
      <input
        type={type}
        className={cn(
          "w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={disabled}
        {...props}
      />
    </div>
  );
}