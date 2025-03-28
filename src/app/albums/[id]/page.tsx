"use client";
import React, { useEffect, useState } from 'react';
import NextImage from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getAlbum, getAlbumTracks, getArtistAlbums } from '@/lib/spotify';
import { usePlayer } from '@/lib/PlayerContext';
import { formatTime, cn } from '@/lib/utils';
import { Play, Pause, Clock3 } from 'lucide-react';
import LikeButton from '@/src/components/common/LikeButton';
import Album, { AlbumTrack, ArtistAlbum } from '@/types/album';
import { ColorThief } from 'color-thief-ts';
import { ReceiptEuro } from 'lucide-react';
import Link from 'next/link';

interface TrackProps {
    id: string;
    name: string;
    artists: Array<{ id: string; name: string }>;
    duration_ms: number;
    track_number: number;
    uri: string;
    albumName?: string;
    albumImages?: Array<{ url: string }>;
    albumId?: string;
}

const AlbumPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { data: session } = useSession();
    const router = useRouter();
    const [album, setAlbum] = useState<Album | null>(null);
    const [tracks, setTracks] = useState<AlbumTrack["items"]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dominantColor, setDominantColor] = useState<string | null>(null);
    const [artistAlbums, setArtistAlbums] = useState<ArtistAlbum["items"] | null>(null);

    const {
        currentTrack,
        isPlaying,
        playTrack,
        pauseTrack,
        resumeTrack,
        addToQueue
    } = usePlayer();

    // Unwrap params with React.use() for future compatibility
    const unwrappedParams: { id: string } = React.use(params);
    const albumId = unwrappedParams.id.includes('spotify:album:')
        ? unwrappedParams.id.split(':')[2]
        : unwrappedParams.id;

    useEffect(() => {
        const fetchAlbumData = async () => {
            setLoading(true);
            try {
                const albumData: Album = await getAlbum(albumId, session);
                const tracksData: AlbumTrack = await getAlbumTracks(albumId, session);
                const albumsByArtists = await Promise.allSettled(
                    albumData.artists.map(artist => getArtistAlbums(artist.id, session))
                );

                const allArtistAlbums = albumsByArtists
                    .filter(result => result.status === 'fulfilled' && result.value && result.value.items)
                    .flatMap(result => (result as PromiseFulfilledResult<ArtistAlbum>).value.items)
                    .filter((album, index, self) => 
                        self.findIndex(a => a.id === album.id) === index
                    );

                if (allArtistAlbums.length > 0) {
                    setArtistAlbums(allArtistAlbums);
                }

                if (albumData) {
                    setAlbum(albumData);
                }

                if (tracksData && tracksData.items) {
                    // Enhance track data with album information
                    const enhancedTracks = tracksData.items.map((track) => ({
                        ...track,
                        albumName: albumData?.name,
                        albumImages: albumData?.images,
                        albumId: albumData?.id
                    }));
                    setTracks(enhancedTracks);
                }
            } catch (err) {
                console.error('Error fetching album data:', err);
                setError('Failed to load album data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (session && tracks.length === 0) {
            fetchAlbumData();
        }
    }, [albumId, session]);

    // New effect to extract dominant color from album artwork
    // useEffect(() => {
    //     if (album?.images?.[0]?.url) {
    //         const extractColor = async () => {
    //             try {
    //                 // Create a temporary image to analyze
    //                 const img = new Image();
    //                 img.crossOrigin = 'Anonymous';
    //                 img.src = album.images[0].url;

    //                 img.onload = () => {
    //                     const colorThief = new ColorThief();
    //                     const color = colorThief.getColor(img);
    //                     console.log(color)
    //                     // Convert RGB array to CSS color string
    //                     setDominantColor(`${color}`);
    //                 };
    //             } catch (err) {
    //                 console.error('Error extracting color:', err);
    //                 // Fallback to default gradient if color extraction fails
    //                 setDominantColor(null);
    //             }
    //         };

    //         extractColor();
    //     }
    // }, [album]);

    const handlePlayAlbum = () => {
        if (!tracks.length || !session) return;

        // Play first track of the album
        playTrack(tracks[0].id, session);

        // add rest tracks to queue
        tracks.forEach((track) => addToQueue({...track, album:{images:[], uri:"", name:""}}));
        
    };

    const handlePlayTrack = (track: TrackProps) => {
        if (!session) return;

        // If this track is already playing, pause/resume it
        if (currentTrack && currentTrack.id === track.id) {
            if (isPlaying) {
                pauseTrack();
            } else {
                resumeTrack();
            }
        } else {
            // Otherwise, play the new track
            playTrack(track.id, session);
        }
    };

    const isTrackPlaying = (trackId: string) => {
        return currentTrack && currentTrack.id === trackId && isPlaying;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-gray-400">Loading album...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-500">
                <p>{error}</p>
                <button
                    onClick={() => router.push('/')}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    if (!album) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p>Album not found</p>
                <button
                    onClick={() => router.push('/')}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    // Calculate total duration of all tracks
    const calculateTotalDuration = () => {
        if (!tracks || tracks.length === 0) return 0;
        return tracks.reduce((total, track) => total + track.duration_ms, 0);
    };

    const totalDuration = calculateTotalDuration();

    return (
        <div className="flex flex-col px-6 pb-24">
            {/* Album header */}
            <div
                className="flex flex-col md:flex-row items-start md:items-end gap-6 p-6"
                style={{
                    backgroundImage: dominantColor
                        ? `linear-gradient(to bottom, ${dominantColor}, rgba(0, 0, 0, 0.8))`
                        : 'linear-gradient(to bottom, rgba(80, 80, 80, 0.8), black)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="relative min-w-[200px] w-[200px] h-[200px] shadow-2xl">
                    <NextImage
                        src={album.images?.[0]?.url || "/spotify-icon.png"}
                        alt={album.name}
                        className="object-cover"
                        fill
                        priority
                        onLoad={(event) => {
                            const img = event.currentTarget as HTMLImageElement;
                            const colorThief = new ColorThief();
                            const color = colorThief.getColor(img);
                            setDominantColor(`${color}`);
                        }}
                    />
                </div>

                <div className="flex flex-col">
                    <p className="uppercase text-sm font-bold">{album.album_type}</p>
                    <h1 className="text-5xl font-bold mt-2 mb-6">{album.name}</h1>
                    <div className="flex items-center text-sm">
                        <span className="font-bold hover:underline cursor-pointer">
                            {album.artists.map((artist: any) => artist.name).join(', ')}
                        </span>
                        <span className="mx-1">•</span>
                        <span style={{ color: dominantColor ?? "#fff" }} className="font-bold" >{album.release_date?.split('-')[0]}</span>
                        <span style={{ color: dominantColor ?? "#fff" }} className="mx-1">•</span>
                        <span style={{ color: dominantColor ?? "#fff" }} className="font-bold" >{tracks.length} songs</span>
                        {totalDuration > 0 && (
                            <>
                                <span style={{ color: dominantColor ?? "#fff" }} className="mx-1">•</span>
                                <span style={{ color: dominantColor ?? "#fff" }} className="font-bold">
                                    {`${Math.floor(totalDuration / 3600000) > 0 ? `${Math.floor(totalDuration / 3600000)} hr ` : ''}${Math.floor((totalDuration % 3600000) / 60000) > 0 ? `${Math.floor((totalDuration % 3600000) / 60000)} min ` : ''}${Math.floor((totalDuration % 60000) / 1000) > 0 ? `${Math.floor((totalDuration % 60000) / 1000)} sec` : ''}`}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Play controls */}
            <div className="flex items-center gap-4 p-6">
                <button
                    onClick={handlePlayAlbum}
                    className="rounded-full bg-green-500 p-4 text-black hover:bg-green-400 transition-colors"
                >
                    {isPlaying && currentTrack && currentTrack.album.uri === albumId ?
                        <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
            </div>

            {/* Tracks list */}
            <div className="w-full mt-4">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="border-b border-gray-800 text-left text-gray-400">
                            <th className="pb-2 pl-4 w-12">#</th>
                            <th className="pb-2">Title</th>
                            <th className='pb-2'>
                                {/* for liked */}
                            </th>
                            <th className="pb-2 pr-4 text-right w-12 flex items-center justify-center">
                                <Clock3 size={16} />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tracks.map((track) => (
                            <tr
                                key={track.id}
                                className="group hover:bg-gray-800 rounded-md"
                                onClick={() => handlePlayTrack(track)}
                            >
                                <td className="py-3 pl-4 w-12 text-gray-400">
                                    <div className="relative flex items-center justify-center w-6 h-6">
                                        <span className={cn(
                                            "group-hover:hidden",
                                            isTrackPlaying(track.id) ? "text-green-500" : ""
                                        )}>
                                            {track.track_number}
                                        </span>
                                        <div className={cn(
                                            "absolute inset-0 hidden group-hover:flex items-center justify-center",
                                            isTrackPlaying(track.id) ? "flex group-hover:flex" : "hidden group-hover:flex"
                                        )}>
                                            {isTrackPlaying(track.id) ? (
                                                <Pause size={16} className="text-green-500" />
                                            ) : (
                                                <Play size={16} className="text-white ml-0.5" />
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3">
                                    <div className="flex flex-col">
                                        <span className={cn(
                                            "font-medium",
                                            isTrackPlaying(track.id) ? "text-green-500" : "text-white"
                                        )}>
                                            {track.name}
                                        </span>
                                        <span className="flex items-center gap-1 text-sm text-gray-400">
                                            {
                                                track.explicit && <ReceiptEuro />
                                            }
                                            {track.artists.map(artist => artist.name).join(', ')}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className="opacity-0 group-hover:opacity-100">
                                        <LikeButton trackId={track.id} size={16} />
                                    </div>
                                </td>
                                <td className="py-3 pr-4 flex items-center gap-4">
                                    <span className="text-gray-400 text-sm">
                                        {formatTime(track.duration_ms / 1000)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Album info */}
            <div className="mt-8 text-gray-400 text-sm">
                <p>Released: {new Date(album.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                {album.label && <p className="mt-1">℗ {album.release_date?.split('-')[0]} {album.label}</p>}
                {album.copyrights && album.copyrights.map((copyright, index) => (
                    <p key={index} className="mt-1">{copyright.text}</p>
                ))}
            </div>

            {/* More by this artist section */}
            {artistAlbums && artistAlbums?.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-2xl font-bold mb-6">
                        More by {album.artists[0].name}
                    </h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {artistAlbums?.map((relatedAlbum) => (
                            <Link 
                                href={`/albums/${relatedAlbum.id}`} 
                                key={relatedAlbum.id}
                                className="group flex flex-col bg-gray-900 p-4 rounded-md hover:bg-gray-800 transition-colors duration-200"
                            >
                                <div className="relative aspect-square w-full mb-4 shadow-lg">
                                    <NextImage 
                                        src={relatedAlbum.images?.[0]?.url || "/spotify-icon.png"}
                                        alt={relatedAlbum.name}
                                        className="object-cover rounded-md"
                                        fill
                                    />
                                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-green-500 rounded-full p-2 shadow-lg">
                                            <Play size={18} className="text-black" />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="font-semibold truncate">{relatedAlbum.name}</h3>
                                <p className="text-gray-400 text-sm mt-1 truncate">
                                    {relatedAlbum.album_type.charAt(0).toUpperCase() + relatedAlbum.album_type.slice(1)} • {' '}
                                    {relatedAlbum.release_date?.split('-')[0]}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default AlbumPage;