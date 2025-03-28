import React from 'react';
import Image from "next/image";
import { useSession } from 'next-auth/react';
import { Play } from "lucide-react";
import { usePlayer } from '@/lib/PlayerContext';
import { getPlaylistTracks, getNewReleases } from "@/lib/spotify";

interface NewReleasesTracks {
    albums: {
        href: string;
        items: {
            album_type: string;
            artists: {
                external_urls: {
                    spotify: string;
                },
                href: string;
                id: string;
                name: string;
                type: string;
                uri: string;
            }[];
            available_markets: string[];
            external_urls: {
                spotify: string;
            };
            href: string;
            id: string;
            images: {
                height: number;
                url: string;
                width: number;
            }[];
            name: string;
            release_date: string;
            release_date_precision: string;
            total_tracks: number;
            type: string;
            uri: string;
        }[];
        limit: number;
        next: string | null;
        offset: number;
        previous: string | null;
        total: number;
    }
}

interface NewReleasesProps {
    loadingTrack: string | null;
    setLoadingTrack: React.Dispatch<React.SetStateAction<string | null>>;
}

const NewReleases: React.FC<NewReleasesProps> = ({ loadingTrack, setLoadingTrack }) => {
    const { data: session } = useSession();
    const { playTrack } = usePlayer();
    const [newReleases, setNewReleases] = React.useState<NewReleasesTracks | null>(null);

    React.useEffect(() => {
        if (!newReleases && session) {
            getNewReleases(session).then(data => {
                setNewReleases(data);
            })
        }
    },[newReleases, session])

    return (
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
    )
}

export default NewReleases