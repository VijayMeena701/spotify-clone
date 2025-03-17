"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle, 
  Volume2, 
  Mic2,
  ListMusic,
  Maximize2,
  Heart
} from "lucide-react";
import { usePlayer } from "@/lib/PlayerContext";
import { formatTime } from "@/lib/utils";
import { useSession } from "next-auth/react";

const FooterPlayer = () => {
  const { data: session } = useSession();
  const { 
    currentTrack, 
    isPlaying, 
    progress, 
    volume, 
    pauseTrack, 
    resumeTrack, 
    setVolume, 
    nextTrack, 
    previousTrack,
    seekPosition,
    deviceId
  } = usePlayer();
  
  const [localVolume, setLocalVolume] = useState(volume);
  const [isInitialized, setIsInitialized] = useState(false);

  // Update local volume when context volume changes
  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  // Once we have a device ID, the player is initialized
  useEffect(() => {
    if (deviceId && !isInitialized) {
      setIsInitialized(true);
    }
  }, [deviceId, isInitialized]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setLocalVolume(newVolume);
    setVolume(newVolume);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentTrack) return;
    
    const newProgress = parseInt(e.target.value);
    const newPositionMs = (newProgress / 100) * currentTrack.duration_ms;
    seekPosition(newPositionMs);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };

  // Format duration from ms to MM:SS format
  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate current time based on progress
  const getCurrentTime = () => {
    if (!currentTrack) return "0:00";
    const totalTimeMs = currentTrack.duration_ms;
    const currentTimeMs = (progress / 100) * totalTimeMs;
    return formatTime(currentTimeMs / 1000);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-gray-900 p-4 h-24 flex items-center justify-between">
      {/* Song info */}
      <div className="flex items-center w-1/4">
        {currentTrack ? (
          <>
            <div className="relative w-14 h-14 mr-3">
              <Image 
                src={currentTrack.album.images[0]?.url || "/spotify-icon.png"} 
                alt={currentTrack.album.name} 
                className="rounded object-cover"
                fill
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{currentTrack.name}</h4>
              <p className="text-xs text-gray-400">{currentTrack.artists.map(a => a.name).join(", ")}</p>
            </div>
            <button className="ml-5 text-gray-400 hover:text-white">
              <Heart size={16} />
            </button>
          </>
        ) : (
          <div className="flex items-center">
            <div className="relative w-14 h-14 mr-3 bg-gray-800 rounded">
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <Pause size={20} />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400">Not Playing</h4>
              <p className="text-xs text-gray-500">
                {!session ? (
                  "Please log in"
                ) : !deviceId ? (
                  "Initializing player..."
                ) : (
                  "Select a track to play"
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Player controls */}
      <div className="flex flex-col items-center w-2/4">
        <div className="flex items-center gap-4 mb-2">
          <button className="text-gray-400 hover:text-white">
            <Shuffle size={18} />
          </button>
          <button 
            className="text-gray-400 hover:text-white"
            onClick={previousTrack}
            disabled={!deviceId || !currentTrack}
          >
            <SkipBack size={18} />
          </button>
          <button 
            className={`rounded-full p-2 text-black hover:scale-105 transition-transform ${deviceId ? 'bg-white' : 'bg-gray-400'}`}
            onClick={togglePlayPause}
            disabled={!deviceId || !currentTrack}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <button 
            className="text-gray-400 hover:text-white"
            onClick={nextTrack}
            disabled={!deviceId || !currentTrack}
          >
            <SkipForward size={18} />
          </button>
          <button className="text-gray-400 hover:text-white">
            <Repeat size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center w-full gap-2">
          <span className="text-xs text-gray-400">{getCurrentTime()}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className="w-full h-1 appearance-none bg-gray-600 rounded-full cursor-pointer"
            style={{
              backgroundImage: `linear-gradient(to right, #fff ${progress}%, #4d4d4d ${progress}%)`,
            }}
            disabled={!currentTrack || !deviceId}
          />
          <span className="text-xs text-gray-400">
            {currentTrack ? formatDuration(currentTrack.duration_ms) : "0:00"}
          </span>
        </div>
      </div>

      {/* Volume controls */}
      <div className="flex items-center justify-end gap-3 w-1/4">
        <button className="text-gray-400 hover:text-white">
          <Mic2 size={16} />
        </button>
        <button className="text-gray-400 hover:text-white">
          <ListMusic size={16} />
        </button>
        <button className="text-gray-400 hover:text-white">
          <Volume2 size={16} />
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={localVolume}
          onChange={handleVolumeChange}
          className="w-24 h-1 appearance-none bg-gray-600 rounded-full cursor-pointer"
          style={{
            backgroundImage: `linear-gradient(to right, #fff ${localVolume}%, #4d4d4d ${localVolume}%)`,
          }}
        />
        <button className="text-gray-400 hover:text-white">
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Show premium required message if needed */}
      {!session?.user && (
        <div className="absolute top-[-40px] left-0 right-0 bg-green-600 text-white text-center py-2 text-sm">
          To play full tracks, you need a Spotify Premium account.
        </div>
      )}
    </div>
  );
};

export default FooterPlayer;