"use client";
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { isTrackSaved, saveTrack, removeTrack } from '@/lib/spotify';
import { cn } from '@/lib/utils'; // Using the cn utility for conditional class names

interface LikeButtonProps {
  trackId: string;
  className?: string;
  size?: number;
}

const LikeButton = ({ trackId, className = "", size = 16 }: LikeButtonProps) => {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if the track is liked when the component mounts or trackId changes
  useEffect(() => {
    const checkIfTrackIsLiked = async () => {
      if (!session || !trackId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const liked = await isTrackSaved(trackId, session);
        setIsLiked(liked);
      } catch (error) {
        console.error('Error checking if track is liked:', error);
        setError('Could not determine like status');
      } finally {
        setIsLoading(false);
      }
    };

    checkIfTrackIsLiked();
  }, [trackId, session]);

  const toggleLike = async () => {
    if (!session) {
      // If no session, prompt login or show a message
      alert('Please log in to like tracks');
      return;
    }

    if (!trackId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let success;
      
      if (isLiked) {
        // Unlike track
        success = await removeTrack(trackId, session);
        if (success) {
          setIsLiked(false);
        } else {
          setError('Failed to unlike track');
        }
      } else {
        // Like track
        success = await saveTrack(trackId, session);
        if (success) {
          setIsLiked(true);
        } else {
          setError('Failed to like track');
        }
      }
    } catch (error) {
      console.error('Error toggling like status:', error);
      setError('Error updating like status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleLike}
      disabled={isLoading || !trackId} 
      className={cn(
        "transition-all duration-200 ease-in-out", 
        isLiked ? "text-green-500" : "text-gray-400 hover:text-white",
        isLoading && "opacity-50 cursor-wait",
        error && "text-red-500",
        className
      )}
      aria-label={isLiked ? "Unlike track" : "Like track"}
      title={error || (isLiked ? "Unlike track" : "Like track")}
    >
      <Heart
        size={size}
        className={isLiked ? "fill-green-500" : ""}
      />
    </button>
  );
};

export default LikeButton;
