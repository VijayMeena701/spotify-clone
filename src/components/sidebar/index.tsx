"use client";
import { Home, Search, Library, Plus, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="w-64 bg-black h-full flex flex-col sticky top-16 z-50">
      {/* Logo and Main Navigation */}
      <div className="bg-[#121212] rounded-lg p-6 mb-2">
        
        <nav>
          <ul className="space-y-4">
            <li>
              <Link href="/" className={`flex items-center gap-4 text-sm font-semibold ${pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                <Home size={24} />
                Home
              </Link>
            </li>
            <li>
              <Link href="/search" className={`flex items-center gap-4 text-sm font-semibold ${pathname === '/search' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                <Search size={24} />
                Search
              </Link>
            </li>
            <li>
              <Link href="/library" className={`flex items-center gap-4 text-sm font-semibold ${pathname === '/library' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                <Library size={24} />
                Your Library
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Playlists Section */}
      <div className="bg-[#121212] rounded-lg p-6 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-semibold">
            <Plus size={20} className="p-1 bg-gray-400 text-gray-800 rounded-sm" />
            Create Playlist
          </button>
        </div>
        
        <div className="flex items-center gap-2 mb-6">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-semibold">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-700 to-gray-400 flex items-center justify-center rounded-sm">
              <Heart size={16} className="text-white" />
            </div>
            Liked Songs
          </button>
        </div>

        <div className="h-px bg-gray-800 w-full mb-4"></div>
        
        {/* Playlist List - Will be dynamic based on user's playlists */}
        <div className="space-y-3">
          {session ? (
            <div className="text-sm text-gray-400 hover:text-white cursor-pointer">
              Your playlists will appear here
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              Log in to see your playlists
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;