"use client"
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Sidebar from "@/src/components/sidebar";
import Navbar from "@/src/components/navbar";
import UserPlaylist from "./features/home/userPlaylist";
// import Recommended from "./features/home/recommendedPlaylist";
// import NewReleases from "./features/home/newReleasesPlaylist";
// import FeaturedPlaylist from "./features/home/featuredPlaylist";


function HomeSection() {
  const { data: session } = useSession();
  const [greeting, setGreeting] = useState<string>("Good morning");
  // const [loading, setLoading] = useState<boolean>(true);
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null);

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, [session]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Image 
          src="/spotify-icon.png" 
          alt="Spotify" 
          width={80} 
          height={80} 
          className="mb-6"
        />
        <h2 className="text-2xl font-bold mb-4">Start listening with a free Spotify account</h2>
        <a href="/login" className="bg-green-500 hover:bg-green-400 text-black font-semibold py-3 px-8 rounded-full">
          Log in
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#1A1A1A] to-[#121212] p-6">
      {/* Header with greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{greeting}</h1>
      </div>

      {/* Recently played / Top picks grid */}
      {/* <div className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(userPlaylists || {items: []})?.items.slice(0, 6).map((playlist) => (
            <div key={playlist.id} className="bg-[#181818] bg-opacity-40 hover:bg-opacity-80 transition-all rounded-md flex items-center group">
              <div className="h-20 w-20 overflow-hidden">
                <Image 
                  src={playlist.images?.[0]?.url || "/spotify-icon.png"} 
                  alt={playlist.name} 
                  width={80} 
                  height={80} 
                  className="rounded-l-md object-cover h-full" 
                />
              </div>
              <div className="flex-1 px-4 font-bold truncate">{playlist.name}</div>
              <div className="opacity-0 group-hover:opacity-100 p-3 transition-opacity">
                <button 
                  className="bg-green-500 rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
                  onClick={() => handlePlayPlaylist(playlist.id)}
                  disabled={loadingTrack === playlist.id}
                >
                  {loadingTrack === playlist.id ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Play fill="black" size={16} className="text-black ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* Featured Playlists Section */}
      {/* <FeaturedPlaylist loadingTrack={loadingTrack} setLoadingTrack={setLoadingTrack} /> */}

      {/* New Releases Section */}
      {/* <NewReleases loadingTrack={loadingTrack} setLoadingTrack={setLoadingTrack} /> */}

      {/* New section for recommended tracks with previews */}
      {/* <Recommended loadingTrack={loadingTrack} setLoadingTrack={setLoadingTrack} /> */}

      {/* Your Playlists Section */}
      <UserPlaylist loadingTrack={loadingTrack} setLoadingTrack={setLoadingTrack} />
    </div>
  );
}

export default function Home() {
	return (
		<>
			<Navbar />
			<div className="flex h-full">
				{/* Sidebar */}
				<Sidebar />
				
				{/* Main Content */}
				<div className="flex-1 flex flex-col h-full overflow-hidden">
					<HomeSection />
				</div>
			</div>
		</>
	)
}