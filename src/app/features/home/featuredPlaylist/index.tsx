import { usePlayer } from '@/lib/PlayerContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import SafeImage from "@/src/components/common/SafeImage";
import { Play } from 'lucide-react';
import { getPlaylistTracks, getFeaturedPlaylists } from '@/lib/spotify';

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

interface FeaturedPlaylistProps {
    loadingTrack: string | null;
    setLoadingTrack: React.Dispatch<React.SetStateAction<string | null>>;
}

const FeaturedPlaylist: React.FC<FeaturedPlaylistProps> = ({ loadingTrack, setLoadingTrack }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const { playTrack } = usePlayer();
    const [featuredPlaylists, setFeaturedPlaylists] = React.useState<FeaturedPlaylists | null>(null);

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

    React.useEffect(() => {
        if (!featuredPlaylists && session) {
            getFeaturedPlaylists(session)
                .then((data) => {
                    setFeaturedPlaylists(data);
                })
                .catch((err) => {
                    console.error("Error fetching featured playlists:", err);
                });
        }
    }, [featuredPlaylists, session])

    return (
        <section className="mb-12">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold hover:underline cursor-pointer">
                    {featuredPlaylists?.message || "Featured Playlists"}
                </h2>
                <span onClick={() => router.push('/playlists/featured/')} className="text-sm text-gray-400 font-bold hover:underline cursor-pointer">Show all</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {featuredPlaylists?.playlists.items.slice(0, 6).map((playlist) => (
                    <div key={playlist.id} className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer">                        <div className="relative mb-4">
                        <div className="aspect-square w-full rounded-md overflow-hidden shadow-lg">
                            <SafeImage
                                src={playlist.images[0]?.url}
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
    )
}

export default FeaturedPlaylist