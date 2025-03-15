"use client";

interface AuthDividerProps {
  text: string;
}

export default function AuthDivider({ text }: AuthDividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-700" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-black px-4 text-xs text-zinc-400">{text}</span>
      </div>
    </div>
  );
}