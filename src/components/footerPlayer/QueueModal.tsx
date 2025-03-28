"use client";
import { useState, useEffect } from 'react';
import { X, Play, Clock, ArrowRightLeft, RefreshCw } from 'lucide-react';
import { usePlayer } from '@/lib/PlayerContext';
import { useSession } from 'next-auth/react';
import { formatTime } from '@/lib/utils';
import Image from 'next/image';

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncQueue?: () => void;
}

const QueueModal = ({ isOpen, onClose, onSyncQueue }: QueueModalProps) => {
  const { data: session } = useSession();
  const { 
    queue, 
    removeFromQueue, 
    currentTrack, 
    playTrack,
    skipToNext,
    addToQueue
  } = usePlayer();
  
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Handle escape key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Sync queue with Spotify when modal is opened
  useEffect(() => {
    if (isOpen) {
      handleSyncQueue();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSyncQueue = async () => {
    if (onSyncQueue && !isSyncing) {
      setIsSyncing(true);
      onSyncQueue();
      // Reset syncing state after a short delay
      setTimeout(() => setIsSyncing(false), 1000);
    }
  };

  const handlePlayTrack = (trackId: string) => {
    if (session) {
      playTrack(trackId, session);
    }
  };

  const handleSkipToTrack = async (trackId: string) => {
    // Skip until we reach the desired track
    while (queue.length > 0 && queue[0].id !== trackId) {
      await skipToNext();
    }
    
    if (queue.length > 0 && queue[0].id === trackId) {
      await skipToNext();
    }
  };

  const handleRemoveFromQueue = (trackId: string) => {
    removeFromQueue(trackId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#282828] rounded-md w-full max-w-2xl max-h-[80vh] shadow-lg relative flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Play Queue</h2>
          <button 
            className="text-gray-400 hover:text-white p-1"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button 
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'queue' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('queue')}
          >
            Queue
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'history' ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-grow p-4">
          {/* Now playing */}
          {currentTrack && (
            <div className="mb-4">
              <h3 className="text-sm text-gray-400 mb-2 uppercase font-semibold">Now playing</h3>
              <div className="flex items-center hover:bg-[#3E3E3E] p-2 rounded-md group">
                <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                  <Image 
                    src={currentTrack.album.images[0]?.url || "/spotify-icon.png"} 
                    alt={currentTrack.album.name} 
                    className="rounded object-cover"
                    width={48}
                    height={48}
                  />
                </div>
                <div className="flex-grow">
                  <p className="text-white text-sm truncate">{currentTrack.name}</p>
                  <p className="text-gray-400 text-xs truncate">{currentTrack.artists.map(a => a.name).join(", ")}</p>
                </div>
                <div className="text-gray-400 text-xs px-2">
                  {formatTime(currentTrack.duration_ms / 1000)}
                </div>
              </div>
            </div>
          )}
          
          {/* Queue */}
          {activeTab === 'queue' && (
            <>
              <h3 className="text-sm text-gray-400 my-2 uppercase font-semibold">Next in queue</h3>
              {queue.length === 0 ? (
                <p className="text-gray-400 text-sm p-2">Your queue is empty</p>
              ) : (
                // Create a unique list of tracks based on track ID
                [...new Map(queue.map(track => [track.id, track])).values()].map((track) => (
                  <div key={track.id} className="flex items-center hover:bg-[#3E3E3E] p-2 rounded-md group">
                    <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                      <Image 
                        src={track.album.images[0]?.url || "/spotify-icon.png"} 
                        alt={track.album.name} 
                        className="rounded object-cover"
                        width={48}
                        height={48}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                        <button 
                          className="text-white hover:scale-110 transition-transform"
                          onClick={() => handleSkipToTrack(track.id)}
                        >
                          <Play size={20} fill="white" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <p className="text-white text-sm truncate">{track.name}</p>
                      <p className="text-gray-400 text-xs truncate">{track.artists.map(a => a.name).join(", ")}</p>
                    </div>
                    <div className="text-gray-400 text-xs px-2">
                      {formatTime(track.duration_ms / 1000)}
                    </div>
                    <button 
                      className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100"
                      onClick={() => handleRemoveFromQueue(track.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
              
              {/* Add more button at the end */}
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm">Want to add more tracks?</p>
                <p className="text-gray-500 text-xs mt-1">Search for a song and use the "Add to Queue" option</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueueModal;