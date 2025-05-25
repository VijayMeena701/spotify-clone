"use client"
import { getFeaturedPlaylists } from "@/lib/spotify";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import SafeImage from "@/src/components/common/SafeImage";
import { Play } from "lucide-react";
import Sidebar from "@/src/components/sidebar";
import FooterPlayer from "@/src/components/footerPlayer";
import Navbar from "@/src/components/navbar";
import { usePlayer } from "@/lib/PlayerContext";
import PlayerWrapper from "@/src/components/PlayerWrapper";
import { Session } from "next-auth";

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
  description?: string;
}

interface FeaturedPlaylists {
  playlists: { items: Playlist[] };
  message?: string;
}

export default function FeaturedPlaylistsPage() {
  const { data: session } = useSession();
  const { playTrack } = usePlayer();
  const [featuredPlaylists, setFeaturedPlaylists] = useState<FeaturedPlaylists | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      setLoading(true);
      setError(null);

      getFeaturedPlaylists(session)
        .then((data) => {
          setFeaturedPlaylists(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching featured playlists:", err);
          setError("Failed to load featured playlists. Please try again later.");
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

  // Render loading state
  if (loading && session) {
    return (
      <>
        <Navbar />
        <div className="flex h-full">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex justify-center items-center h-full">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">Loading featured playlists...</p>
              </div>
            </div>
          </div>
        </div>
        <FooterPlayer />
        <PlayerWrapper />
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Navbar />
        <div className="flex h-full">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex flex-col items-center justify-center h-full">              <SafeImage
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
          </div>
        </div>
        <FooterPlayer />
        <PlayerWrapper />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="bg-gradient-to-b from-[#1A1A1A] to-[#121212] p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold">
                {featuredPlaylists?.message || "Featured Playlists"}
              </h1>
              <p className="text-gray-400 mt-2">Check out the latest curated playlists from Spotify</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500 text-white p-4 rounded-md mb-8">
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Grid of all playlists */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {featuredPlaylists?.playlists.items.map((playlist) => (
                <div key={playlist.id} className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer">
                  <div className="relative mb-4">                    <div className="aspect-square w-full rounded-md overflow-hidden shadow-lg">
                    <SafeImage
                      src={playlist.images[0]?.url}
                      alt={playlist.name}
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

            {/* Empty state */}
            {(!featuredPlaylists || featuredPlaylists.playlists.items.length === 0) && !loading && !error && (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-gray-400 text-lg mb-4">No featured playlists available right now</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-white text-black font-bold py-2 px-6 rounded-full hover:bg-opacity-80"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <FooterPlayer />
      <PlayerWrapper />
    </>
  );
}

// Helper function to get playlist tracks
async function getPlaylistTracks(playlistId: string, session: Session) {
  const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    }
  });

  if (!result.ok) {
    throw new Error('Failed to fetch playlist tracks');
  }

  return await result.json();
}