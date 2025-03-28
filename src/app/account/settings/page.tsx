"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Globe, Lock, Moon, Sun, Volume2 } from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState({
    theme: "dark",
    language: "english",
    audioQuality: "high",
    autoPlay: true,
    explicitContent: true,
    notifications: true,
  });

  if (status === "loading") {
    return (
      <div className="h-full overflow-auto">
        <div className="bg-gradient-to-b from-zinc-900 to-black p-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleChange = (setting: keyof typeof settings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="h-full overflow-auto">
      <div className="bg-gradient-to-b from-zinc-900 to-black p-6 min-h-full">
        <div className="max-w-3xl mx-auto pb-20">
          {/* Back button and header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/account" className="bg-black/40 p-2 rounded-full hover:bg-black/60">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>

          {/* Settings Sections */}
          <div className="space-y-8">
            {/* Appearance Section */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sun size={20} /> 
                Appearance
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Theme</h3>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleChange("theme", "dark")}
                      className={`flex flex-col items-center p-4 rounded-lg border ${settings.theme === "dark" 
                        ? "border-green-500 bg-zinc-700" 
                        : "border-zinc-600 bg-zinc-900"}`}
                    >
                      <Moon size={24} className="mb-2" />
                      <span>Dark</span>
                      {settings.theme === "dark" && (
                        <CheckCircle size={16} className="text-green-500 mt-2" />
                      )}
                    </button>
                    <button 
                      onClick={() => handleChange("theme", "light")}
                      className={`flex flex-col items-center p-4 rounded-lg border ${settings.theme === "light" 
                        ? "border-green-500 bg-zinc-700" 
                        : "border-zinc-600 bg-zinc-900"}`}
                    >
                      <Sun size={24} className="mb-2" />
                      <span>Light</span>
                      {settings.theme === "light" && (
                        <CheckCircle size={16} className="text-green-500 mt-2" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Language</h3>
                  <select
                    value={settings.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="japanese">Japanese</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Playback Section */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Volume2 size={20} />
                Playback
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Audio Quality</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="high" 
                        name="audioQuality" 
                        checked={settings.audioQuality === "high"} 
                        onChange={() => handleChange("audioQuality", "high")}
                        className="w-4 h-4 accent-green-500" 
                      />
                      <label htmlFor="high" className="ml-2 block">
                        <span className="font-medium">High</span>
                        <p className="text-sm text-gray-400">320 kbps</p>
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="normal" 
                        name="audioQuality" 
                        checked={settings.audioQuality === "normal"} 
                        onChange={() => handleChange("audioQuality", "normal")}
                        className="w-4 h-4 accent-green-500" 
                      />
                      <label htmlFor="normal" className="ml-2 block">
                        <span className="font-medium">Normal</span>
                        <p className="text-sm text-gray-400">160 kbps</p>
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="low" 
                        name="audioQuality" 
                        checked={settings.audioQuality === "low"} 
                        onChange={() => handleChange("audioQuality", "low")}
                        className="w-4 h-4 accent-green-500" 
                      />
                      <label htmlFor="low" className="ml-2 block">
                        <span className="font-medium">Low</span>
                        <p className="text-sm text-gray-400">96 kbps</p>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Autoplay</h3>
                    <p className="text-sm text-gray-400">Play similar songs when your music ends</p>
                  </div>
                  <button 
                    onClick={() => handleToggle("autoPlay")}
                    className={`w-12 h-6 rounded-full ${settings.autoPlay ? "bg-green-500" : "bg-zinc-600"} relative transition-colors`}
                  >
                    <span 
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.autoPlay ? "left-7" : "left-1"}`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Settings */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Lock size={20} />
                Content Settings
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Explicit Content</h3>
                    <p className="text-sm text-gray-400">Allow playback of songs with explicit content</p>
                  </div>
                  <button 
                    onClick={() => handleToggle("explicitContent")}
                    className={`w-12 h-6 rounded-full ${settings.explicitContent ? "bg-green-500" : "bg-zinc-600"} relative transition-colors`}
                  >
                    <span 
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.explicitContent ? "left-7" : "left-1"}`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Globe size={20} />
                Notifications
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-gray-400">Receive notifications about new releases and events</p>
                  </div>
                  <button 
                    onClick={() => handleToggle("notifications")}
                    className={`w-12 h-6 rounded-full ${settings.notifications ? "bg-green-500" : "bg-zinc-600"} relative transition-colors`}
                  >
                    <span 
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.notifications ? "left-7" : "left-1"}`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button 
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-black font-medium rounded-full transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}