"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { LogOut, User, Settings, HelpCircle, ExternalLink } from "lucide-react";

export default function AccountMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/signup"
          className="text-sm text-gray-400 hover:text-white px-4 py-2 font-medium"
        >
          Sign up
        </Link>
        <Link
          href="/login"
          className="bg-white text-black px-6 py-2 rounded-full font-semibold text-sm hover:scale-105 transition"
        >
          Log in
        </Link>
      </div>
    );
  }

  const userImage = session.user?.image || "/spotify-icon.png";
  
  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center gap-2 bg-black hover:bg-zinc-800 rounded-full p-0.5 pr-2 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 relative rounded-full overflow-hidden">
          <Image
            src={userImage}
            alt={session.user?.name || "User"}
            fill
            className="object-cover"
          />
        </div>
        <span className="text-sm font-medium max-w-[100px] truncate">
          {session.user?.name || "User"}
        </span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[#282828] divide-y divide-gray-700 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <Link
              href="/account"
              className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#3E3E3E]"
              onClick={() => setIsOpen(false)}
            >
              <User size={16} />
              Account
            </Link>
            <Link
              href="/account/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#3E3E3E]"
              onClick={() => setIsOpen(false)}
            >
              <User size={16} />
              Profile
            </Link>
            <Link
              href="/account/settings"
              className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#3E3E3E]"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={16} />
              Settings
            </Link>
            <a 
              href="https://support.spotify.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#3E3E3E]"
              onClick={() => setIsOpen(false)}
            >
              <HelpCircle size={16} />
              Support
              <ExternalLink size={12} className="ml-auto" />
            </a>
          </div>
          <div className="py-1">
            <button
              onClick={() => {
                signOut({ callbackUrl: "/" });
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-white hover:bg-[#3E3E3E]"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}