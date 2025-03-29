"use client"
import React from 'react'
import Image from "next/image";
import { Play } from "lucide-react";
import { usePlayer } from '@/lib/PlayerContext';
import { useSession } from 'next-auth/react';
import { getRecommendedTracks } from "@/lib/spotify"

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

interface RecommendedTracksProps {
    loadingTrack: string | null;
    setLoadingTrack: React.Dispatch<React.SetStateAction<string | null>>;
}

const Recommended: React.FC<RecommendedTracksProps> = ({ loadingTrack, setLoadingTrack }) => {
    const [recommendedTracks, setRecommendedTracks] = React.useState<RecommendedTracks | null>(null);
    const { playTrack } = usePlayer();
    const { data: session } = useSession();

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

    React.useEffect(() => {
        if(!recommendedTracks && session) {
            getRecommendedTracks(session).then(data => {
                setRecommendedTracks(data);
            })

        }
    },[recommendedTracks, session])

    return (
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
    )
}

export default Recommended