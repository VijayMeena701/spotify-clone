"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Edit, User, Settings, Bell, Shield, CreditCard } from "lucide-react";

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-full overflow-auto">
        <div className="bg-gradient-to-b from-zinc-900 to-black p-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  const userImage = session.user?.image || "/spotify-icon.png";
  const userName = session.user?.name || "User";
  const userEmail = session.user?.email || "";

  return (
    <div className="h-full overflow-auto">
      <div className="bg-gradient-to-b from-zinc-900 to-black p-6 min-h-full">
        <div className="max-w-5xl mx-auto pb-20">
          <h1 className="text-3xl font-bold mb-8">Account</h1>

          {/* Profile Summary Card */}
          <div className="bg-zinc-800 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden">
                <Image 
                  src={userImage} 
                  alt={userName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{userName}</h2>
                <p className="text-gray-400">{userEmail}</p>
              </div>
              <Link 
                href="/account/profile" 
                className="bg-transparent hover:bg-white/10 text-white px-6 py-3 rounded-full border border-gray-600 transition-colors"
              >
                Edit profile
              </Link>
            </div>
          </div>

          {/* Account Settings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              href="/account/profile" 
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-6 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-3 rounded-full">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Profile</h3>
                    <p className="text-sm text-gray-400">Manage your public profile</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-gray-400 group-hover:text-white transition-colors" />
              </div>
            </Link>

            <Link 
              href="/account/settings" 
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-6 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-green-600 p-3 rounded-full">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Account Settings</h3>
                    <p className="text-sm text-gray-400">Manage your account settings</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-gray-400 group-hover:text-white transition-colors" />
              </div>
            </Link>

            <Link 
              href="/account/notifications" 
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-6 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-600 p-3 rounded-full">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Notifications</h3>
                    <p className="text-sm text-gray-400">Manage your notification preferences</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-gray-400 group-hover:text-white transition-colors" />
              </div>
            </Link>

            <Link 
              href="/account/privacy" 
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-6 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-red-600 p-3 rounded-full">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Privacy & Security</h3>
                    <p className="text-sm text-gray-400">Manage your privacy and security</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-gray-400 group-hover:text-white transition-colors" />
              </div>
            </Link>

            <Link 
              href="/account/subscription" 
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-6 transition-colors group md:col-span-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-600 p-3 rounded-full">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Subscription Plan</h3>
                    <p className="text-sm text-gray-400">View your current plan and payment info</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-gray-400 group-hover:text-white transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}