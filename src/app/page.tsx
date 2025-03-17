"use client"
import { getFeaturedPlaylists, getNewReleases, getUserPlaylists, getPlaylistTracks, getTrack } from "@/lib/spotify";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock, Heart, MoreHorizontal, Play, Pause } from "lucide-react";
import Sidebar from "@/src/components/sidebar";
import FooterPlayer from "@/src/components/footerPlayer";
import Navbar from "@/src/components/navbar";
import { usePlayer } from "@/lib/PlayerContext";
import PlayerWrapper from "@/src/components/PlayerWrapper";

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
  description?: string;
}

interface Album {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { name: string }[];
}

interface FeaturedPlaylists {
  playlists: { items: Playlist[] };
  message?: string;
}

interface NewReleases {
  albums: { items: Album[] };
}

interface UserPlaylists {
  items: Playlist[];
}

// Add a new interface for recommended tracks
interface RecommendedTracks {
  tracks: {
    id: string;
    name: string;
    album: {
      images: { url: string }[];
      name: string;
    };
    artists: { name: string }[];
    preview_url: string;
  }[];
}

function HomeSection() {
  const { data: session } = useSession();
  const { playTrack, isPlaying, currentTrack, pauseTrack, resumeTrack } = usePlayer();
  const [featuredPlaylists, setFeaturedPlaylists] = useState<FeaturedPlaylists | null>(null);
  const [newReleases, setNewReleases] = useState<NewReleases | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylists | null>(null);
  const [recommendedTracks, setRecommendedTracks] = useState<RecommendedTracks | null>(null);
  const [greeting, setGreeting] = useState<string>("Good morning");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
    
    if (session) {
      setLoading(true);
      setError(null);
      
      // Using Promise.allSettled to make sure all promises complete, even if some fail
      Promise.allSettled([
        // getFeaturedPlaylists(session),
        getNewReleases(session),
        getUserPlaylists(session),
        // getRecommendedTracks(session)
      ]).then(results => {
        // Handle featured playlists result
        // if (results[0].status === 'fulfilled') {
        //   setFeaturedPlaylists(results[0].value);
        // }
        
        // Handle new releases result
        if (results[0].status === 'fulfilled') {
          setNewReleases(results[0].value);
        }
        
        // Handle user playlists result
        if (results[1].status === 'fulfilled') {
          setUserPlaylists(results[1].value);
        }
        
        // Handle recommended tracks result
        // if (results[3].status === 'fulfilled') {
        //   setRecommendedTracks(results[3].value);
        // }
        
        setLoading(false);
      }).catch(err => {
        console.error("Error fetching data:", err);
        setError("Failed to load some content. Please try again later.");
        setLoading(false);
      });
    }
  }, [session]);

  // Handler for playing a track from a playlist
  const handlePlayPlaylist = async (playlistId: string) => {
    if (!session) return;
    
    try {
      setLoadingTrack(playlistId);
      // Get the first track from the playlist
      const playlistTracks = await getPlaylistTracks(playlistId, session);
      
      if (playlistTracks && playlistTracks.items && playlistTracks.items.length > 0) {
        const firstTrack = playlistTracks.items[0].track;
        if (firstTrack && firstTrack.id) {
          await playTrack(firstTrack.id, session);
        }
      }
    } catch (err) {
      console.error("Error playing playlist:", err);
    } finally {
      setLoadingTrack(null);
    }
  };

  // Add a handler for playing a track directly
  const handlePlayTrack = async (trackId: string) => {
    if (!session) return;
    
    try {
      setLoadingTrack(trackId);
      await playTrack(trackId, session);
    } catch (err) {
      console.error("Error playing track:", err);
    } finally {
      setLoadingTrack(null);
    }
  };

  // Render loading state
  if (loading && session) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading content...</p>
        </div>
      </div>
    );
  }

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

  // Render global error message if needed
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/30 border border-red-500 text-white p-4 rounded-md mb-8">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
        
        {/* Render whatever content we did manage to load */}
        <div className="bg-gradient-to-b from-[#1A1A1A] to-[#121212]">
          {/* Header with greeting */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{greeting}</h1>
          </div>
          
          {/* Rest of content would go here */}
        </div>
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
      <div className="mb-12">
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
      </div>

      {/* Featured Playlists Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold hover:underline cursor-pointer">
            {featuredPlaylists?.message || "Featured Playlists"}
          </h2>
          <span className="text-sm text-gray-400 font-bold hover:underline cursor-pointer">Show all</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {featuredPlaylists?.playlists.items.slice(0, 6).map((playlist) => (
            <div key={playlist.id} className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer">
              <div className="relative mb-4">
                <div className="aspect-square w-full rounded-md overflow-hidden shadow-lg">
                  <Image 
                    src={playlist.images[0]?.url || "/spotify-icon.png"} 
                    alt={playlist.name} 
                    className="object-cover" 
                    fill
                  />
                </div>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
              <h3 className="text-base font-bold truncate">{playlist.name}</h3>
              <p className="text-sm text-gray-400 line-clamp-2 mt-1">{playlist.description || "Playlist"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* New Releases Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold hover:underline cursor-pointer">New Releases</h2>
          <span className="text-sm text-gray-400 font-bold hover:underline cursor-pointer">Show all</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {newReleases?.albums.items.slice(0, 6).map((album) => (
            <div key={album.id} className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer">
              <div className="relative mb-4">
                <div className="aspect-square w-full rounded-md overflow-hidden shadow-lg">
                  <Image 
                    src={album.images[0]?.url || "/spotify-icon.png"} 
                    alt={album.name} 
                    className="object-cover" 
                    fill
                  />
                </div>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="bg-green-500 rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
                    onClick={() => {
                      if (session && album.id) {
                        setLoadingTrack(album.id);
                        // For albums, we need to get the first track ID
                        getPlaylistTracks(album.id, session)
                          .then(tracks => {
                            if (tracks && tracks.items && tracks.items.length > 0) {
                              const firstTrack = tracks.items[0].track;
                              if (firstTrack && firstTrack.id) {
                                return playTrack(firstTrack.id, session);
                              }
                            }
                            throw new Error("No tracks found");
                          })
                          .catch(err => {
                            console.error("Error playing album:", err);
                          })
                          .finally(() => {
                            setLoadingTrack(null);
                          });
                      }
                    }}
                    disabled={loadingTrack === album.id}
                  >
                    {loadingTrack === album.id ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Play fill="black" size={16} className="text-black ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
              <h3 className="text-base font-bold truncate">{album.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{album.artists.map(artist => artist.name).join(", ")}</p>
            </div>
          ))}
        </div>
      </section>

      {/* New section for recommended tracks with previews */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold hover:underline cursor-pointer">Recommended Tracks with Previews</h2>
          <span className="text-sm text-gray-400 font-bold hover:underline cursor-pointer">Refresh</span>
        </div>
        
        <div className="bg-[#181818] p-6 rounded-md">
          <div className="grid grid-cols-1 gap-2">
            {recommendedTracks?.tracks?.slice(0, 5).map((track) => (
              <div key={track.id} className="flex items-center justify-between py-2 px-4 hover:bg-[#282828] rounded-md group">
                <div className="flex items-center flex-1">
                  <div className="relative w-10 h-10 mr-4">
                    <Image 
                      src={track.album?.images[0]?.url || "/spotify-icon.png"} 
                      alt={track.album?.name} 
                      className="rounded object-cover" 
                      fill
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button 
                        onClick={() => handlePlayTrack(track.id)}
                        disabled={loadingTrack === track.id}
                        className="text-white"
                      >
                        {loadingTrack === track.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Play fill="white" size={16} className="ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{track.name}</h3>
                    <p className="text-sm text-gray-400">{track.artists.map(artist => artist.name).join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-400 mr-4">
                    {track.preview_url ? "Preview Available" : "No Preview"}
                  </span>
                  <button 
                    className="bg-green-500 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handlePlayTrack(track.id)}
                    disabled={loadingTrack === track.id}
                  >
                    {loadingTrack === track.id ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Play fill="black" size={14} className="text-black ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {(!recommendedTracks || recommendedTracks.tracks.length === 0) && (
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-400">No tracks with previews available</p>
            </div>
          )}
        </div>
      </section>

      {/* Your Playlists Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold hover:underline cursor-pointer">Your Playlists</h2>
          <span className="text-sm text-gray-400 font-bold hover:underline cursor-pointer">Show all</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {(userPlaylists || {items: []})?.items?.slice(0, 6).map((playlist) => (
            <div key={playlist.id} className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer">
              <div className="relative mb-4">
                <div className="aspect-square w-full rounded-md overflow-hidden shadow-lg">
                  <Image 
                    src={playlist?.images?.[0]?.url || "/spotify-icon.png"} 
                    alt={playlist.name} 
                    className="object-cover" 
                    fill
                  />
                </div>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
              <h3 className="text-base font-bold truncate">{playlist.name}</h3>
              <p className="text-sm text-gray-400 mt-1">Your playlist</p>
            </div>
          ))}
        </div>
      </section>
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
			
			{/* Footer Player */}
			<FooterPlayer />
			
			{/* Spotify Web Player (invisible) */}
			<PlayerWrapper />
		</>
	)
}