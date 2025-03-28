"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, Camera, Edit3 } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: "",
    bio: ""
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

  const userImage = session.user?.image || "/spotify-icon.png";
  const userName = session.user?.name || "User";
  const userEmail = session.user?.email || "";

  const handleEditToggle = () => {
    if (!isEditing) {
      // Initialize form data when entering edit mode
      setProfileData({
        displayName: userName,
        bio: "Music enthusiast and playlist curator"
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would submit the profile changes to your API
    // For now, we'll just exit edit mode
    setIsEditing(false);
    // Show a success message (in a real app)
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
            <h1 className="text-3xl font-bold">Profile</h1>
          </div>

          {isEditing ? (
            // Edit mode
            <form onSubmit={handleSubmit} className="bg-zinc-800 rounded-lg p-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Profile image section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden">
                      <Image 
                        src={userImage} 
                        alt={userName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <button 
                        type="button"
                        className="bg-green-500 p-3 rounded-full"
                      >
                        <Camera size={24} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">Click to upload new image</p>
                </div>
                
                {/* Form fields */}
                <div className="flex-1 space-y-6 w-full">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="w-full px-4 py-3 bg-zinc-900/20 border border-zinc-700 rounded-md text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-md text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">Tell others a bit about yourself</p>
                  </div>
                  
                  <div className="flex gap-4 justify-end pt-4">
                    <button
                      type="button"
                      onClick={handleEditToggle}
                      className="px-6 py-2 border border-white/50 text-white rounded-full hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-full"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            // View mode
            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Profile image */}
                <div className="relative w-40 h-40 rounded-full overflow-hidden">
                  <Image 
                    src={userImage} 
                    alt={userName}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Profile details */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{userName}</h2>
                    <button 
                      onClick={handleEditToggle}
                      className="flex items-center gap-2 bg-transparent hover:bg-white/10 text-white px-4 py-2 rounded-full border border-gray-600 transition-colors"
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Email</h3>
                      <p className="text-white">{userEmail}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Bio</h3>
                      <p className="text-white">Music enthusiast and playlist curator</p>
                    </div>
                    
                    <div className="pt-4 border-t border-zinc-700">
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Account Type</h3>
                      <div className="flex items-center gap-2">
                        <span className="bg-green-500 text-black px-3 py-1 rounded-full text-xs font-medium">
                          Premium
                        </span>
                        <span className="text-sm text-white">Since March 2023</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Public profile preview - shown in both view and edit modes */}
          <div className="mt-8 bg-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Public Profile</h2>
            <div className="bg-zinc-900 rounded-lg p-4 flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image 
                  src={userImage} 
                  alt={userName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold">{userName}</h3>
                <p className="text-sm text-gray-400">0 followers · 0 following</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}