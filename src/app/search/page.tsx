"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import NextImage from 'next/image';
import Link from 'next/link';
import { Play, Pause, Clock3 } from 'lucide-react';
import { searchSpotify } from '@/lib/spotify';
import { usePlayer } from '@/lib/PlayerContext';
import { formatTime, cn } from '@/lib/utils';
import LikeButton from '@/src/components/common/LikeButton';

// Define types for search results
type Artist = {
  id: string;
  name: string;
  images?: Array<{ url: string; height: number; width: number }>;
  followers?: { total: number };
  uri: string;
};

type Album = {
  id: string;
  name: string;
  album_type: string;
  images: Array<{ url: string; height: number; width: number }>;
  artists: Artist[];
  release_date: string;
  uri: string;
};

type Track = {
  id: string;
  name: string;
  duration_ms: number;
  explicit: boolean;
  artists: Artist[];
  album: Album;
  uri: string;
};

type Playlist = {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string; height: number; width: number }>;
  owner: { display_name: string };
  uri: string;
};

type SearchResults = {
  tracks?: { items: Track[] };
  albums?: { items: Album[] };
  artists?: { items: Artist[] };
  playlists?: { items: Playlist[] };
};

const SearchPage = () => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';

  const [searchResults, setSearchResults] = useState<SearchResults>({});
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'tracks' | 'albums' | 'artists' | 'playlists'>('tracks');

  const {
    currentTrack,
    isPlaying,
    playTrack,
    pauseTrack,
    resumeTrack
  } = usePlayer();

  useEffect(() => {
    const performSearch = async () => {
      if (!query || !session) return;

      setLoading(true);
      try {
        // Search for tracks, albums, artists, and playlists
        const results = await searchSpotify(
          query,
          ['track', 'album', 'artist', 'playlist'],
          session
        );

        setSearchResults(results);
      } catch (error) {
        console.error('Error searching Spotify:', error);
      } finally {
        setLoading(false);
      }
    };

    if (query && session) {
      performSearch();
    }
  }, [query, session]);

  const handlePlayTrack = (track: Track) => {
    if (!session) return;

    if (currentTrack && currentTrack.id === track.id) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    } else {
      playTrack(track.id, session);
    }
  };

  const isTrackPlaying = (trackId: string) => {
    return currentTrack && currentTrack.id === trackId && isPlaying;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-gray-400">Searching...</div>
      </div>
    );
  }

  if (query && !loading && searchResults && Object.keys(searchResults).every(key => !searchResults[key as keyof SearchResults]?.items?.length)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <h1 className="text-3xl font-bold mb-4">No results found for &ldquo;{query}&rdquo;</h1>
        <p className="text-gray-400">Please try again with a different search term.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {query ? `Search results for "${query}"` : 'Search Spotify'}
        </h1>
      </div>

      {query && (
        <>
          {/* Navigation tabs for result categories */}
          <div className="flex border-b border-gray-800 mb-6">
            <button
              className={`px-6 py-3 text-sm font-semibold ${activeSection === 'tracks' ? 'text-white border-b-2 border-green-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveSection('tracks')}
            >
              Songs
            </button>
            <button
              className={`px-6 py-3 text-sm font-semibold ${activeSection === 'artists' ? 'text-white border-b-2 border-green-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveSection('artists')}
            >
              Artists
            </button>
            <button
              className={`px-6 py-3 text-sm font-semibold ${activeSection === 'albums' ? 'text-white border-b-2 border-green-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveSection('albums')}
            >
              Albums
            </button>
            <button
              className={`px-6 py-3 text-sm font-semibold ${activeSection === 'playlists' ? 'text-white border-b-2 border-green-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveSection('playlists')}
            >
              Playlists
            </button>
          </div>

          {/* Tracks Section */}
          {activeSection === 'tracks' && searchResults.tracks && (
            <div className="w-full">
              <h2 className="text-xl font-bold mb-4">Songs</h2>
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-800 text-left text-gray-400">
                    <th className="pb-2 pl-4 w-12">#</th>
                    <th className="pb-2">Title</th>
                    <th className="pb-2">Album</th>
                    <th className='pb-2'></th>
                    <th className="pb-2 pr-4 text-right w-12 flex items-center justify-center">
                      <Clock3 size={16} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.tracks.items.map((track, index) => (
                    <tr
                      key={track.id}
                      className="group hover:bg-gray-800 rounded-md"
                    >
                      <td className="py-3 pl-4 w-12 text-gray-400">
                        <div className="relative flex items-center justify-center w-6 h-6">
                          <span className={cn(
                            "group-hover:hidden",
                            isTrackPlaying(track.id) ? "text-green-500" : ""
                          )}>
                            {index + 1}
                          </span>
                          <div 
                            className={cn(
                              "absolute inset-0 hidden group-hover:flex items-center justify-center",
                              isTrackPlaying(track.id) ? "flex group-hover:flex" : "hidden group-hover:flex"
                            )}
                            onClick={() => handlePlayTrack(track)}
                          >
                            {isTrackPlaying(track.id) ? (
                              <Pause size={16} className="text-green-500" />
                            ) : (
                              <Play size={16} className="text-white ml-0.5" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3" onClick={() => handlePlayTrack(track)}>
                        <div className="flex items-center">
                          <div className="relative min-w-[40px] w-[40px] h-[40px] mr-3">
                            <NextImage
                              src={track.album.images?.[0]?.url || "/spotify-icon.png"}
                              alt={track.album.name}
                              className="object-cover rounded"
                              fill
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className={cn(
                              "font-medium",
                              isTrackPlaying(track.id) ? "text-green-500" : "text-white"
                            )}>
                              {track.name}
                            </span>
                            <span className="text-sm text-gray-400">
                              {track.artists.map((artist) => artist.name).join(", ")}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-gray-400">
                        <Link 
                          href={`/albums/${track.album.id}`}
                          className="hover:underline hover:text-white"
                        >
                          {track.album.name}
                        </Link>
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
          )}

          {/* Artists Section */}
          {activeSection === 'artists' && searchResults.artists && (
            <div>
              <h2 className="text-xl font-bold mb-4">Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {searchResults.artists.items.map((artist) => (
                  <Link 
                    key={artist.id} 
                    href={`/artists/${artist.id}`}
                    className="group bg-[#181818] hover:bg-[#282828] p-4 rounded-md transition-colors"
                  >
                    <div className="relative aspect-square w-full mb-4">
                      <NextImage
                        src={artist.images?.[0]?.url || "/spotify-icon.png"}
                        alt={artist.name}
                        className="rounded-full object-cover"
                        fill
                      />
                    </div>
                    <h3 className="font-bold truncate">{artist.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">Artist</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Albums Section */}
          {activeSection === 'albums' && searchResults.albums && (
            <div>
              <h2 className="text-xl font-bold mb-4">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {searchResults.albums.items.map((album) => (
                  <Link 
                    key={album.id} 
                    href={`/albums/${album.id}`}
                    className="group bg-[#181818] hover:bg-[#282828] p-4 rounded-md transition-colors"
                  >
                    <div className="relative aspect-square w-full mb-4 shadow-lg">
                      <NextImage
                        src={album.images?.[0]?.url || "/spotify-icon.png"}
                        alt={album.name}
                        className="rounded object-cover"
                        fill
                      />
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-green-500 rounded-full p-2 shadow-lg">
                          <Play size={18} className="text-black" />
                        </div>
                      </div>
                    </div>
                    <h3 className="font-bold truncate">{album.name}</h3>
                    <p className="text-sm text-gray-400 mt-1 truncate">
                      {album.release_date?.split('-')[0]} • {album.artists.map(artist => artist.name).join(', ')}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Playlists Section */}
          {activeSection === 'playlists' && searchResults.playlists && (
            <div>
              <h2 className="text-xl font-bold mb-4">Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {searchResults.playlists.items.filter(item => item !== null && item !== undefined).map((playlist) => (
                  <Link 
                    key={playlist.id} 
                    href={`/playlists/${playlist.id}`}
                    className="group bg-[#181818] hover:bg-[#282828] p-4 rounded-md transition-colors"
                  >
                    <div className="relative aspect-square w-full mb-4 shadow-lg">
                      <NextImage
                        src={playlist.images?.[0]?.url || "/spotify-icon.png"}
                        alt={playlist.name}
                        className="rounded object-cover"
                        fill
                      />
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-green-500 rounded-full p-2 shadow-lg">
                          <Play size={18} className="text-black" />
                        </div>
                      </div>
                    </div>
                    <h3 className="font-bold truncate">{playlist.name}</h3>
                    <p className="text-sm text-gray-400 mt-1 truncate">
                      By {playlist.owner.display_name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Initial state when no query */}
      {!query && (
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-bold mb-4">Enter a search term above</h2>
          <p className="text-gray-400">Search for artists, albums, songs, or playlists</p>
        </div>
      )}
    </div>
  );
};

const Page = () => {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <SearchPage />
    </React.Suspense>
  );
}


export default Page;